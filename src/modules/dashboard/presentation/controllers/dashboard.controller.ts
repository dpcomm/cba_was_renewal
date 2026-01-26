import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ok } from '@shared/responses/api-response';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { JwtGuard } from '@shared/decorators/jwt-guard.decorator';
import { RankGuard } from '@shared/decorators/rank-guard.decorator';
import { UserRank } from '@modules/user/domain/enums/user-rank.enum';
import { DashboardService } from '@modules/dashboard/application/services/dashboard.service';
import { GetDashboardSummaryRequestDto } from '@modules/dashboard/application/dto/dashboard.request.dto';
import { DashboardSummaryResponseDto } from '@modules/dashboard/presentation/dto/dashboard.response.dto';

@ApiTags('Dashboard')
@Controller('dashboard')
@JwtGuard()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @RankGuard(UserRank.ADMIN)
  @ApiOperation({ summary: '대시보드 요약 통계 조회' })
  @ApiSuccessResponse({ type: DashboardSummaryResponseDto })
  async getSummary(@Query() dto: GetDashboardSummaryRequestDto) {
    const summary = await this.dashboardService.getSummary(dto.retreatId);
    return ok<DashboardSummaryResponseDto>(
      summary,
      'Success get dashboard summary',
    );
  }
}
