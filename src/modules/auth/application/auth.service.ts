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
    const payload = { id: user.id };
    const accessToken = this.jwtService.sign(payload);
    const expiresIn = parseInt(process.env.JWT_REFRESH_EXPIRENTTIME || '2592000');

    const refreshToken = this.jwtService.sign(
      { id: user.id },
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
    const exists = await this.userService.findOneByUserId(dto.userId).catch(() => null);
    if (exists) {
      throw new BadRequestException(ERROR_MESSAGES.USER_ALREADY_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const newUser = await this.userService.create({
      ...dto,
      password: hashedPassword,
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

      const accessToken = this.jwtService.sign({ id: userId });
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

  async verifyEmail(email: string, code: string): Promise<void> {
    const redisKey = `email_verification:${email}`;
    const storedCode = await this.redis.get(redisKey);

    if (!storedCode) {
      throw new BadRequestException(ERROR_MESSAGES.EMAIL_VERIFICATION_CODE_EXPIRED);
    }
    
    if (storedCode !== code) {
      throw new BadRequestException(ERROR_MESSAGES.EMAIL_VERIFICATION_CODE_INVALID);
    }

    await this.redis.del(redisKey);
  }
}