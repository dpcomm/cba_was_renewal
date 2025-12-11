import { Injectable, NotFoundException, UnauthorizedException, Inject } from "@nestjs/common";
import { UserService } from "@modules/user/application/user.service";
import { User } from "@modules/user/domain/entities/user.entity";
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { RedisClientType } from 'redis';

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
      throw new NotFoundException('User not found');
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    
    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Invalid password');
    }
    return user;
  }

  async login(user: User, autoLogin: boolean = false) {
    const payload = { id: user.id };
    const accessToken = this.jwtService.sign(payload);
    let refreshToken: string | null = null;

    if (autoLogin) {
      refreshToken = this.jwtService.sign({}, {
        expiresIn: parseInt(process.env.JWT_REFRESH_EXPIRENTTIME || '604800'),
      });
      await this.redis.set(String(user.id), refreshToken);
    }

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}