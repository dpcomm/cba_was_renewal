import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../application/auth.service';
import { User } from '@modules/user/domain/entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'userId',
      passwordField: 'password',
    });
  }

  async validate(userId: string, password: string): Promise<User> {
    const user = await this.authService.validateUser(userId, password);
    return user;
  }
}
