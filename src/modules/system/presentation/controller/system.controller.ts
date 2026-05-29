import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { ApiFailureResponse } from '@shared/decorators/api-failure-response.decorator';
import { ok } from '@shared/responses/api-response';
import { SystemService } from '../../application/services/system.service';
import { JwtGuard } from '@shared/decorators/jwt-guard.decorator';
import { RankGuard } from '@shared/decorators/rank-guard.decorator';
import { UserRank } from '@modules/user/domain/enums/user-rank.enum';
import {
  SystemConfigOptionsResponseDto,
  SystemConfigResponseDto,
} from '../dto/system-config.response.dto';
import { UpdateSystemConfigDto } from '../dto/update-system-config.request.dto';
import { SystemConfig } from '@modules/system/domain/entities/system-config.entity';

@ApiTags('System')
@Controller('system')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get()
  @ApiOperation({ summary: '시스템 설정 조회' })
  @ApiSuccessResponse({ type: SystemConfigResponseDto })
  async getSystemConfig() {
    const config = await this.systemService.getConfig();

    return ok(this.toResponse(config), 'System config retrieved successfully');
  }

  @Get('admin/options')
  @RankGuard(UserRank.ADMIN)
  @JwtGuard()
  @ApiOperation({
    summary: '[관리자] 시스템 설정(수련회, 학기)) 선택 옵션 조회',
  })
  @ApiSuccessResponse({ type: SystemConfigOptionsResponseDto })
  @ApiFailureResponse(403, 'Forbidden')
  async getSystemConfigOptions() {
    const options = await this.systemService.getOptions();
    return ok(options, 'System config options retrieved successfully');
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
    return ok(this.toResponse(updated), 'System config updated successfully');
  }

  private toResponse(config: SystemConfig): SystemConfigResponseDto {
    return {
      application: {
        name: config.appName,
        versionName: config.versionName,
        versionCode: config.versionCode,
        minimumVersionCode: config.minimumVersionCode,
      },
      consents: {
        privacyPolicy: {
          url: config.privacyPolicyUrl,
          version: config.privacyPolicyVersion,
          updatedAt: config.privacyPolicyUpdatedAt,
        },
      },
      maintenance: {
        mode: config.maintenanceMode,
        message: config.maintenanceMessage,
      },
      currentTermId: config.currentTermId,
      currentRetreatId: config.currentRetreatId,
      currentTerm: config.currentTerm
        ? {
            id: config.currentTerm.id,
            name: config.currentTerm.name,
          }
        : null,
      currentRetreat: config.currentRetreat
        ? {
            id: config.currentRetreat.id,
            title: config.currentRetreat.title,
          }
        : null,
      updatedAt: config.updatedAt,
    };
  }
}
