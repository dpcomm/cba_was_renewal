import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { UserRank } from '@modules/user/domain/enums/user-rank.enum';
import { RanksGuard, RANKS_KEY } from '../guards/ranks.guard';

/**
 * 지정된 등급(Rank)을 가진 사용자만 접근을 허용하는 데코레이터.
 * RanksGuard가 자동으로 적용되므로 별도로 UseGuards를 추가할 필요가 없습니다.
 * 
 * @example
 * @RankGuard(UserRank.ADMIN)
 * async adminOnly() { ... }
 */
export const RankGuard = (...ranks: UserRank[]) =>
  applyDecorators(SetMetadata(RANKS_KEY, ranks), UseGuards(RanksGuard));
