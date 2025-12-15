import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { ok } from '@shared/responses/api-response';
import * as statusConfig from '@shared/config/status.json';
import { VersionResponseDto } from './dto/version.response.dto';

@ApiTags('Status')
@Controller('status')
export class StatusController {
  @Get('version/application')
  @ApiOperation({ summary: '앱 버전 정보 조회' })
  @ApiSuccessResponse({ type: VersionResponseDto })
  getApplicationVersion() {
    const versionData = statusConfig.application;
    return ok(versionData, 'Version check successful');
  }
}
