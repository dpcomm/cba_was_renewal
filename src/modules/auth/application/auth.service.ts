import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { MailService } from '@infrastructure/mail/mail.service';
import { UserService } from "@modules/user/application/user.service";
import { User } from "@modules/user/domain/entities/user.entity";
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { RedisClientType } from 'redis';
import { ERROR_MESSAGES } from '../../../shared/constants/error-messages';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from '../presentation/dto/auth.response.dto';
import { UserResponseDto } from '@modules/user/presentation/dto/user.response.dto';
import { ResetPasswordDto } from "../presentation/dto/reset-password.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @Inject('REDIS_CLIENT') private readonly redis: RedisClientType,
    private readonly mailService: MailService,
  ) {}

  async validateUser(userId: string, password: string): Promise<User> {
    const user = await this.userService.findOneByUserId(userId).catch(() => null);
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }
    
    return user;
  }

  async login(user: User): Promise<AuthResponseDto> {
    const payload = { id: user.id, rank: user.rank };
    const accessToken = this.jwtService.sign(payload);
    const expiresIn = parseInt(process.env.JWT_REFRESH_EXPIRENTTIME || '2592000');

    const refreshToken = this.jwtService.sign(
      { id: user.id, rank: user.rank },
      { expiresIn },
    );
    await this.redis.set(String(user.id), refreshToken, { EX: expiresIn });

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
        throw new BadRequestException(ERROR_MESSAGES.EMAIL_VERIFICATION_CODE_INVALID);
      }
    } catch (e) {
      if (e instanceof BadRequestException) throw e;
      throw new BadRequestException(ERROR_MESSAGES.EMAIL_VERIFICATION_CODE_EXPIRED);
    }

    const exists = await this.userService.findOneByUserId(dto.userId).catch(() => null);
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

    return new UserResponseDto(newUser);
  }

  async logout(user: User): Promise<void> {
    if (!user) throw new BadRequestException(ERROR_MESSAGES.USER_NOT_FOUND);
    await this.redis.del(String(user.id));
  }

  async refresh(refreshToken: string): Promise<{ access_token: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const userId = payload.id;
      
      const storedRefreshToken = await this.redis.get(String(userId));
      if (storedRefreshToken !== refreshToken) {
        throw new UnauthorizedException(ERROR_MESSAGES.INVAILD_REFRESH_TOKEN);
      }

      const accessToken = this.jwtService.sign({ id: userId, rank: payload.rank });
      return { access_token: accessToken };
    } catch (e) {
      throw new UnauthorizedException(ERROR_MESSAGES.INVAILD_REFRESH_TOKEN);
    }
  }

  async sendEmail(email: string): Promise<void> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const redisKey = `email_verification:${email}`;
    console.log(`[AuthService] Generating verification code for ${email}: ${code}`);
    
    // 3분(180초) 유효
    await this.redis.set(redisKey, code, { EX: 180 });
    await this.mailService.sendVerificationEmail(email, code);
  }

  async verifyEmail(email: string, code: string): Promise<{ verificationToken: string }> {
    const redisKey = `email_verification:${email}`;
    const storedCode = await this.redis.get(redisKey);

    if (!storedCode) {
      throw new BadRequestException(ERROR_MESSAGES.EMAIL_VERIFICATION_CODE_EXPIRED);
    }
    
    if (storedCode !== code) {
      throw new BadRequestException(ERROR_MESSAGES.EMAIL_VERIFICATION_CODE_INVALID);
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
        secret: process.env.JWT_SECRET
      }
    );

    return { verificationToken };
  }

  async checkIdDuplicate(userId: string): Promise<boolean> {
    const user = await this.userService.findOneByUserId(userId).catch(() => null);
    return !!user;
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    try {
      const payload = this.jwtService.verify(dto.verificationToken, {
        secret: process.env.JWT_SECRET,
      });

      if (payload.type !== 'verification' || payload.email !== dto.email) {
        throw new BadRequestException(ERROR_MESSAGES.EMAIL_VERIFICATION_CODE_INVALID);
      }
    } catch (e) {
      if (e instanceof BadRequestException) throw e;
      throw new BadRequestException(ERROR_MESSAGES.EMAIL_VERIFICATION_CODE_EXPIRED);
    }

    const user = await this.userService.findOneByEmail(dto.email);
    await this.userService.updateUser(user.id, {
      password: dto.newPassword
    });
  }
}