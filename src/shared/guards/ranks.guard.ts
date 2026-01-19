import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRank } from '@modules/user/domain/enums/user-rank.enum';

export const RANKS_KEY = 'ranks';

@Injectable()
export class RanksGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRanks = this.reflector.getAllAndOverride<UserRank[]>(RANKS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRanks) return true;

    const { user } = context.switchToHttp().getRequest();
    
    if (!user || !user.rank) return false;

    return requiredRanks.includes(user.rank);
  }
}
