import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { UserService } from "@modules/user/application/user.service";
import { User } from "@modules/user/domain/entities/user.entity";
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { RedisClientType } from 'redis';
import { ERROR_MESSAGES } from '../../../shared/constants/error-messages';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from '../presentation/dto/auth.response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @Inject('REDIS_CLIENT') private readonly redis: RedisClientType,
  ) {}

  async validateUser(userId: string, password: string): Promise<User> {
    const user = await this.userService.findOneByUserId(userId);
    if (!user) {
      throw new BadRequestException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    
    if (!isPasswordCorrect) {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_PASSWORD);
    }
    return user;
  }

  async login(user: User, autoLogin: boolean = false): Promise<AuthResponseDto> {
    const payload = { id: user.id };
    const accessToken = this.jwtService.sign(payload);
    let refreshToken: string | null = null;
    const expiresIn = parseInt(process.env.JWT_REFRESH_EXPIRENTTIME || '604800');

    if (autoLogin) {
      refreshToken = this.jwtService.sign(
        { id: user.id },
        {
          expiresIn,
        },
      );
      await this.redis.set(String(user.id), refreshToken, { EX: expiresIn });
    }

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: (() => {
        const { password, ...result } = user;
        return result;
      })(),
    };
  }

  async register(dto: RegisterDto): Promise<Omit<User, 'password'>> {
    const exists = await this.userService.findOneByUserId(dto.userId).catch(() => null);
    if (exists) {
      throw new BadRequestException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const newUser = await this.userService.create({
      ...dto,
      password: hashedPassword,
    });

    const { password, ...result } = newUser;
    return result;
  }

  async logout(user: User): Promise<void> {
    if (!user) return;
    await this.redis.del(String(user.id));
  }

  async refresh(refreshToken: string): Promise<{ access_token: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const userId = payload.id;
      
      const storedToken = await this.redis.get(String(userId));
      if (storedToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const accessToken = this.jwtService.sign({ id: userId });
      return { access_token: accessToken };
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}