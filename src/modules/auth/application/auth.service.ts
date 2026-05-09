import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  Inject,
  Logger,
} from '@nestjs/common';
import { GetUserQuery } from '@modules/user/application/queries/get-user.query';
import { SearchUsersQuery } from '@modules/user/application/queries/search-users.query';
import { CreateUserUseCase } from '@modules/user/application/usecases/create-user.usecase';
import { UpdateUserProfileUseCase } from '@modules/user/application/usecases/update-user-profile.usecase';
import { User } from '@modules/user/domain/entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { RedisClientType } from 'redis';
import { randomUUID } from 'crypto';
import { ERROR_MESSAGES } from '../../../shared/constants/error-messages';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from '../presentation/dto/auth.response.dto';
import { UserResponseDto } from '@modules/user/presentation/dto/response/user.response.dto';
import { ResetPasswordDto } from '../presentation/dto/reset-password.dto';
import { EmailVerificationType } from '../domain/enums/email-verification-type.enum';
import { maskString } from '../../../shared/utils/mask.util';
import {
  generateMailVerificationCode,
  generateMailVerificationToken,
  validateMailVerificationToken,
} from '@shared/utils/mail-verification.util';
import { RabbitMqProducerService } from '@infrastructure/rabbitmq/rabbitmq.producer.service';
import {
  RABBITMQ_QUEUES,
  RABBITMQ_ROUTING_KEYS,
} from '@shared/constants/rabbitmq.constants';
import { EmailVerificationRequestedMessage } from '@infrastructure/rabbitmq/rabbitmq.messages';
import {
  REDIS_CLIENT_TOKEN,
  REDIS_KEYS,
  REDIS_TTL_SECONDS,
} from '@shared/constants/redis.constants';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly getUserQuery: GetUserQuery,
    private readonly searchUsersQuery: SearchUsersQuery,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserProfile: UpdateUserProfileUseCase,
    private readonly jwtService: JwtService,
    @Inject(REDIS_CLIENT_TOKEN) private readonly redis: RedisClientType,
    private readonly rabbitMqProducer: RabbitMqProducerService,
  ) {}

  async validateUser(userId: string, password: string): Promise<User> {
    const user = await this.getUserQuery.byUserId(userId).catch(() => null);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    return user;
  }

  async login(user: User): Promise<AuthResponseDto> {
    const payload = { id: user.id, userId: user.userId, rank: user.rank };
    const accessToken = this.jwtService.sign(payload);
    const expiresIn = parseInt(
      process.env.JWT_REFRESH_EXPIRENTTIME || '2592000',
    );

    const refreshToken = this.jwtService.sign(
      { id: user.id, userId: user.userId, rank: user.rank },
      { expiresIn },
    );
    await this.redis.set(REDIS_KEYS.AUTH_REFRESH_TOKEN(user.id), refreshToken, {
      EX: expiresIn,
    });

    this.logger.log(
      `로그인 성공 - 사용자: ${user.name} (${user.userId}, ID: ${user.id})`,
    );
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: new UserResponseDto(user),
    };
  }

  async register(dto: RegisterDto): Promise<UserResponseDto> {
    validateMailVerificationToken(
      this.jwtService,
      dto.verificationToken,
      dto.email,
    );

    const emailExists = await this.getUserQuery
      .byEmail(dto.email)
      .catch(() => null);
    if (emailExists) {
      throw new BadRequestException(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    const exists = await this.getUserQuery
      .byUserId(dto.userId)
      .catch(() => null);
    if (exists) {
      throw new BadRequestException(ERROR_MESSAGES.USER_ALREADY_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const newUser = await this.createUserUseCase.execute({
      userId: dto.userId,
      password: hashedPassword,
      name: dto.name,
      group: dto.group,
      phone: dto.phone,
      email: dto.email,
      emailVerifiedAt: new Date(),
      updatedAt: new Date(),
      birth: dto.birth ? new Date(dto.birth) : undefined,
      gender: dto.gender,
      rank: dto.rank,
    });

    this.logger.log(`회원가입 완료 - 사용자 ID: ${newUser.userId}`);

    return new UserResponseDto(newUser);
  }

  async logout(user: User): Promise<void> {
    if (!user) throw new BadRequestException(ERROR_MESSAGES.USER_NOT_FOUND);
    await this.redis.del(REDIS_KEYS.AUTH_REFRESH_TOKEN(user.id));
    this.logger.log(`로그아웃 완료 - 사용자 ID: ${user.userId}`);
  }

  async refresh(refreshToken: string): Promise<{ access_token: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const userId = Number(payload.id);

      const storedRefreshToken = await this.redis.get(
        REDIS_KEYS.AUTH_REFRESH_TOKEN(userId),
      );
      if (storedRefreshToken !== refreshToken) {
        throw new UnauthorizedException(ERROR_MESSAGES.INVAILD_REFRESH_TOKEN);
      }

      const user = await this.getUserQuery.byId(userId);

      const accessToken = this.jwtService.sign({
        id: userId,
        userId: user.userId,
        rank: payload.rank,
      });
      this.logger.log(
        `세션 갱신 (자동 로그인) - 사용자: ${user.name} (${user.userId})`,
      );
      return { access_token: accessToken };
    } catch (e) {
      if (e instanceof BadRequestException) throw e;
      throw new UnauthorizedException(ERROR_MESSAGES.INVAILD_REFRESH_TOKEN);
    }
  }

  async sendEmail(
    email: string,
    type: EmailVerificationType,
    userId?: string,
  ): Promise<void> {
    const existingUser = await this.getUserQuery
      .byEmail(email)
      .catch(() => null);

    // 회원가입, 이메일 변경: 이미 등록된 이메일이면 에러
    if (
      type === EmailVerificationType.REGISTER ||
      type === EmailVerificationType.UPDATE
    ) {
      if (existingUser) {
        throw new BadRequestException(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
      }
    }
    // 비밀번호 재설정: 등록되지 않은 이메일이면 에러, userId와 email이 불일치하면 에러
    else if (type === EmailVerificationType.RESET_PASSWORD) {
      if (!existingUser) {
        throw new BadRequestException(ERROR_MESSAGES.EMAIL_NOT_REGISTERED);
      }
      if (userId && existingUser.userId !== userId) {
        throw new BadRequestException(ERROR_MESSAGES.USER_EMAIL_MISMATCH);
      }
    }

    const code = generateMailVerificationCode();
    const redisKey = REDIS_KEYS.AUTH_EMAIL_VERIFICATION_CODE(email);
    this.logger.log(`[인증번호 생성] 이메일: ${email}, 코드: ${code}`);

    // 3분(180초) 유효
    await this.redis.set(redisKey, code, {
      EX: REDIS_TTL_SECONDS.EMAIL_VERIFICATION_CODE,
    });
    const occurredAt = new Date().toISOString();
    const message: EmailVerificationRequestedMessage = {
      messageId: randomUUID(),
      jobId: randomUUID(),
      eventType: RABBITMQ_ROUTING_KEYS.EMAIL_VERIFICATION_REQUESTED,
      occurredAt,
      producer: 'cba-was-renewal-api',
      version: 1,
      data: {
        email,
        code,
        verificationType: type,
      },
      meta: {
        retryCount: 0,
      },
    };
    await this.rabbitMqProducer.publish({
      queue: RABBITMQ_QUEUES.EMAIL_VERIFICATION_REQUESTED,
      routingKey: RABBITMQ_ROUTING_KEYS.EMAIL_VERIFICATION_REQUESTED,
      payload: message,
    });
  }

  async verifyEmail(
    email: string,
    code: string,
  ): Promise<{ verificationToken: string }> {
    const redisKey = REDIS_KEYS.AUTH_EMAIL_VERIFICATION_CODE(email);
    const storedCode = await this.redis.get(redisKey);

    if (!storedCode) {
      throw new BadRequestException(
        ERROR_MESSAGES.EMAIL_VERIFICATION_CODE_EXPIRED,
      );
    }

    if (storedCode !== code) {
      throw new BadRequestException(
        ERROR_MESSAGES.EMAIL_VERIFICATION_CODE_INVALID,
      );
    }

    await this.redis.del(redisKey);

    // 비밀번호 재설정과 같은 기타 동작에 필요한 임시 토큰 발급
    const verificationToken = generateMailVerificationToken(
      this.jwtService,
      email,
    );

    return { verificationToken };
  }

  async checkIdDuplicate(userId: string): Promise<boolean> {
    const user = await this.getUserQuery.byUserId(userId).catch(() => null);
    return !!user;
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    validateMailVerificationToken(
      this.jwtService,
      dto.verificationToken,
      dto.email,
    );

    const user = await this.getUserQuery.byEmail(dto.email);
    await this.updateUserProfile.execute(user.id, {
      password: dto.newPassword,
    });
    this.logger.log(`비밀번호 재설정 완료: ${user.email} (${user.name})`);
  }

  async findId(name: string, phone: string): Promise<{ userIds: string[] }> {
    const users = await this.searchUsersQuery.findByNameAndPhone(name, phone);
    return {
      userIds: users.map((user) => maskString(user.userId)),
    };
  }
}
