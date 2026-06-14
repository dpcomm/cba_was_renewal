import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { ApiFailureResponse } from '@shared/decorators/api-failure-response.decorator';
import { ok } from '@shared/responses/api-response';
import {
  SystemConfigOptionsResponseDto,
  SystemConfigResponseDto,
} from '../dto/response/system-config.response.dto';
import { UpdateSystemConfigRequestDto } from '../dto/request/update-system-config.request.dto';
import { AdminGuard } from '@shared/decorators/admin-guard.decorator';
import { GetSystemConfigQuery } from '../../application/queries/get-system-config.query';
import { GetSystemConfigOptionsQuery } from '../../application/queries/get-system-config-options.query';
import { UpdateSystemConfigUseCase } from '../../application/usecases/update-system-config.usecase';

@ApiTags('System')
@Controller('system')
export class SystemController {
  constructor(private readonly getSystemConfigQuery: GetSystemConfigQuery) {}

  @Get()
  @ApiOperation({ summary: '시스템 설정 조회' })
  @ApiSuccessResponse({ type: SystemConfigResponseDto })
  async getSystemConfig() {
    const config = await this.getSystemConfigQuery.execute();

    return ok(
      new SystemConfigResponseDto(config),
      'System config retrieved successfully',
    );
  }
}

@ApiTags('Admin System')
@AdminGuard()
@Controller('admin/system')
export class AdminSystemController {
  constructor(
    private readonly getSystemConfigOptionsQuery: GetSystemConfigOptionsQuery,
    private readonly updateSystemConfigUseCase: UpdateSystemConfigUseCase,
  ) {}

  @Get('options')
  @ApiOperation({
    summary: '[관리자] 시스템 설정(수련회, 선택식 강의 시즌) 옵션 조회',
  })
  @ApiSuccessResponse({ type: SystemConfigOptionsResponseDto })
  @ApiFailureResponse(403, 'Forbidden')
  async getSystemConfigOptions() {
    const options = await this.getSystemConfigOptionsQuery.execute();
    return ok(
      new SystemConfigOptionsResponseDto(options),
      'System config options retrieved successfully',
    );
  }

  @Put()
  @ApiOperation({ summary: '[관리자] 시스템 설정 수정' })
  @ApiSuccessResponse({})
  @ApiFailureResponse(403, 'Forbidden')
  async updateSystemConfig(
    @Body()
    body: UpdateSystemConfigRequestDto,
  ) {
    const updated = await this.updateSystemConfigUseCase.execute({
      ...body,
    });
    return ok(
      new SystemConfigResponseDto(updated),
      'System config updated successfully',
    );
  }
}
