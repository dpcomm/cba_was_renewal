import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { ApiFailureResponse } from '@shared/decorators/api-failure-response.decorator';
import { ok } from '@shared/responses/api-response';
import { SystemService } from '@modules/system/application/services/system.service';
import { JwtGuard } from '@shared/decorators/jwt-guard.decorator';
import { RankGuard } from '@shared/decorators/rank-guard.decorator';
import { UserRank } from '@modules/user/domain/enums/user-rank.enum';
import { SystemConfigResponseDto } from '../dto/system-config.response.dto';
import { UpdateSystemConfigDto } from '../dto/update-system-config.request.dto';

@ApiTags('System')
@Controller('system')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get()
  @ApiOperation({ summary: '시스템 설정 조회 (버전, 현재 학기/수련회 ID)' })
  @ApiSuccessResponse({ type: SystemConfigResponseDto })
  async getSystemConfig() {
    const config = await this.systemService.getConfig();
    if (!config) {
      return ok(null, 'No config found');
    }

    return ok(
      {
        application: {
          name: config.appName,
          versionName: config.versionName,
          versionCode: config.versionCode,
        },
        consents: {
          privacyPolicy: {
            url: config.privacyPolicyUrl,
            version: config.privacyPolicyVersion,
          },
        },
        currentTermId: config.currentTermId,
        currentRetreatId: config.currentRetreatId,
      },
      'System config retrieved successfully',
    );
  }

  @Put('admin')
  @RankGuard(UserRank.ADMIN)
  @JwtGuard()
  @ApiOperation({ summary: '[관리자] 시스템 설정 수정' })
  @ApiSuccessResponse({})
  @ApiFailureResponse(403, 'Forbidden')
  async updateSystemConfig(
    @Body()
    body: UpdateSystemConfigDto,
  ) {
    const updated = await this.systemService.updateConfig(body);
    return ok(updated, 'System config updated successfully');
  }
}
