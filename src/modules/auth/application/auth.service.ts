import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  Inject,
  Logger,
} from '@nestjs/common';
import { MailService } from '@infrastructure/mail/mail.service';
import { UserService } from '@modules/user/application/user.service';
import { User } from '@modules/user/domain/entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { RedisClientType } from 'redis';
import { ERROR_MESSAGES } from '../../../shared/constants/error-messages';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from '../presentation/dto/auth.response.dto';
import { UserResponseDto } from '@modules/user/presentation/dto/user.response.dto';
import { ResetPasswordDto } from '../presentation/dto/reset-password.dto';
import { EmailVerificationType } from '../domain/enums/email-verification-type.enum';
import { maskString } from '../../../shared/utils/mask.util';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @Inject('REDIS_CLIENT') private readonly redis: RedisClientType,
    private readonly mailService: MailService,
  ) {}

  async validateUser(userId: string, password: string): Promise<User> {
    const user = await this.userService
      .findOneByUserId(userId)
      .catch(() => null);

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
    await this.redis.set(String(user.id), refreshToken, { EX: expiresIn });

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
    try {
      const payload = this.jwtService.verify(dto.verificationToken, {
        secret: process.env.JWT_SECRET,
      });

      if (payload.type !== 'verification' || payload.email !== dto.email) {
        throw new BadRequestException(
          ERROR_MESSAGES.EMAIL_VERIFICATION_CODE_INVALID,
        );
      }
    } catch (e) {
      if (e instanceof BadRequestException) throw e;
      throw new BadRequestException(
        ERROR_MESSAGES.EMAIL_VERIFICATION_CODE_EXPIRED,
      );
    }

    const emailExists = await this.userService
      .findOneByEmail(dto.email)
      .catch(() => null);
    if (emailExists) {
      throw new BadRequestException(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    const exists = await this.userService
      .findOneByUserId(dto.userId)
      .catch(() => null);
    if (exists) {
      throw new BadRequestException(ERROR_MESSAGES.USER_ALREADY_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const newUser = await this.userService.create({
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
    await this.redis.del(String(user.id));
    this.logger.log(`로그아웃 완료 - 사용자 ID: ${user.userId}`);
  }

  async refresh(refreshToken: string): Promise<{ access_token: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const userId = Number(payload.id);

      const storedRefreshToken = await this.redis.get(String(userId));
      if (storedRefreshToken !== refreshToken) {
        throw new UnauthorizedException(ERROR_MESSAGES.INVAILD_REFRESH_TOKEN);
      }

      const user = await this.userService.findOneById(userId);

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
    const existingUser = await this.userService
      .findOneByEmail(email)
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

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const redisKey = `email_verification:${email}`;
    this.logger.log(`[인증번호 생성] 이메일: ${email}, 코드: ${code}`);

    // 3분(180초) 유효
    await this.redis.set(redisKey, code, { EX: 180 });
    await this.mailService.sendVerificationEmail(email, code);
  }

  async verifyEmail(
    email: string,
    code: string,
  ): Promise<{ verificationToken: string }> {
    const redisKey = `email_verification:${email}`;
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
    const verificationToken = this.jwtService.sign(
      {
        email,
        type: 'verification',
      },
      {
        expiresIn: '5m',
        secret: process.env.JWT_SECRET,
      },
    );

    return { verificationToken };
  }

  async checkIdDuplicate(userId: string): Promise<boolean> {
    const user = await this.userService
      .findOneByUserId(userId)
      .catch(() => null);
    return !!user;
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    try {
      const payload = this.jwtService.verify(dto.verificationToken, {
        secret: process.env.JWT_SECRET,
      });

      if (payload.type !== 'verification' || payload.email !== dto.email) {
        throw new BadRequestException(
          ERROR_MESSAGES.EMAIL_VERIFICATION_CODE_INVALID,
        );
      }
    } catch (e) {
      if (e instanceof BadRequestException) throw e;
      throw new BadRequestException(
        ERROR_MESSAGES.EMAIL_VERIFICATION_CODE_EXPIRED,
      );
    }

    const user = await this.userService.findOneByEmail(dto.email);
    await this.userService.updateUser(user.id, {
      password: dto.newPassword,
    });
    this.logger.log(`비밀번호 재설정 완료: ${user.email} (${user.name})`);
  }

  async findId(name: string, phone: string): Promise<{ userIds: string[] }> {
    const users = await this.userService.findUsersByNameAndPhone(name, phone);
    return {
      userIds: users.map((user) => maskString(user.userId)),
    };
  }
}
