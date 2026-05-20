import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApplicationService } from '@modules/application/application/services/application.service';
import { AdminGuard } from '@shared/decorators/admin-guard.decorator';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { ApiFailureResponse } from '@shared/decorators/api-failure-response.decorator';
import { ok } from '@shared/responses/api-response';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';
import { User } from '@shared/decorators/user.decorator';
import { User as UserEntity } from '@modules/user/domain/entities/user.entity';

import { AdminScanResponseDto } from '../dto/response/admin-scan.response.dto';
import { AdminApplicationListDto } from '../dto/request/admin-application-list.request.dto';
import { AdminApplicationListResponseDto } from '../dto/response/admin-application-list.response.dto';
import { CheckInDto } from '../dto/request/check-in.request.dto';
import { CheckInResponseDto } from '../dto/response/check-in.response.dto';

@ApiTags('Admin / Application')
@Controller('admin/application')
@AdminGuard()
export class ApplicationAdminController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Get('scan/:userId/:retreatId')
  @ApiOperation({ summary: '[관리자] QR 스캔 시 사용자 정보 조회' })
  @ApiSuccessResponse({ type: AdminScanResponseDto })
  @ApiFailureResponse(404, ERROR_MESSAGES.APPLICATION_NOT_FOUND)
  async adminScan(
    @Param('userId') userId: string,
    @Param('retreatId', ParseIntPipe) retreatId: number,
  ) {
    const result = await this.applicationService.adminScan(userId, retreatId);
    return ok<AdminScanResponseDto>(result, 'Success admin scan');
  }

  @Get('list')
  @ApiOperation({ summary: '[관리자] 수련회 신청자 목록 조회 (검색/필터)' })
  @ApiSuccessResponse({ type: AdminApplicationListResponseDto, isArray: true })
  async getApplicationList(@Query() query: AdminApplicationListDto) {
    const list = await this.applicationService.getApplicationList(query);
    return ok<AdminApplicationListResponseDto[]>(
      list,
      'Success get application list',
    );
  }

  @Post('check-in')
  @ApiOperation({ summary: '[관리자] 체크인 확정 처리' })
  @ApiSuccessResponse({ type: CheckInResponseDto })
  @ApiFailureResponse(404, ERROR_MESSAGES.APPLICATION_NOT_FOUND)
  async adminCheckIn(@User() admin: UserEntity, @Body() dto: CheckInDto) {
    const result = await this.applicationService.checkIn(
      dto.userId,
      dto.retreatId,
      admin.userId,
    );
    return ok<CheckInResponseDto>(result, 'Success check-in');
  }
}
