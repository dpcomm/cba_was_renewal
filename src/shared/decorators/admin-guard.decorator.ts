import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RanksGuard, RANKS_KEY } from '../guards/ranks.guard';
import { UserRank } from '@modules/user/domain/enums/user-rank.enum';

/**
 * 관리자 전용 접근 제어를 위한 통합 데코레이터.
 * JWT 인증과 ADMIN 등급 확인을 순차적으로 수행하며 Swagger 설정이 포함되어 있습니다.
 */
export const AdminGuard = () =>
  applyDecorators(
    SetMetadata(RANKS_KEY, [UserRank.ADMIN]),
    UseGuards(JwtAuthGuard, RanksGuard),
    ApiBearerAuth(),
  );