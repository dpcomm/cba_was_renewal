import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ERROR_MESSAGES } from '../../../../shared/constants/error-messages';

export const RefreshToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(ERROR_MESSAGES.INVAILD_REFRESH_TOKEN);
    }

    return authHeader.replace('Bearer ', '');
  },
);
