import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiTags, ApiOperation } from '@nestjs/swagger';
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
import { AdminApplicationDetailResponseDto } from '../dto/response/admin-application-detail.response.dto';
import { CheckInDto } from '../dto/request/check-in.request.dto';
import { CheckInResponseDto } from '../dto/response/check-in.response.dto';
import { ScanApplicationQuery } from '@modules/application/application/queries/admin/scan-application.query';
import { GetAdminApplicationListQuery } from '@modules/application/application/queries/admin/get-admin-application-list.query';
import { GetAdminApplicationDetailQuery } from '@modules/application/application/queries/admin/get-admin-application-detail.query';
import { CheckInApplicationUseCase } from '@modules/application/application/usecases/admin/check-in-application.usecase';
import { AdminApplicationDetailMapper } from '../mappers/admin-application-detail.mapper';
import { UpdateAdminApplicationRequestDto } from '../dto/request/update-admin-application.request.dto';
import { AdminApplicationUpdateResponseDto } from '../dto/response/admin-application-update.response.dto';
import { UpdateAdminApplicationUseCase } from '@modules/application/application/usecases/admin/update-admin-application.usecase';

@ApiTags('Admin / Application')
@Controller('admin/applications')
@AdminGuard()
export class ApplicationAdminController {
  constructor(
    private readonly scanApplicationQuery: ScanApplicationQuery,
    private readonly getAdminApplicationListQuery: GetAdminApplicationListQuery,
    private readonly getApplicationDetailQuery: GetAdminApplicationDetailQuery,
    private readonly checkInApplicationUseCase: CheckInApplicationUseCase,
    private readonly updateAdminApplicationUseCase: UpdateAdminApplicationUseCase,
  ) {}

  @Get('scan/:userId/:retreatId')
  @ApiOperation({ summary: '[관리자] QR 스캔 시 사용자 정보 조회' })
  @ApiSuccessResponse({ type: AdminScanResponseDto })
  @ApiFailureResponse(404, ERROR_MESSAGES.APPLICATION_NOT_FOUND)
  async adminScan(
    @Param('userId') userId: string,
    @Param('retreatId', ParseIntPipe) retreatId: number,
  ) {
    const result = await this.scanApplicationQuery.execute(userId, retreatId);
    return ok<AdminScanResponseDto>(result, 'Success admin scan');
  }

  @Get()
  @ApiOperation({ summary: '[관리자] 수련회 신청자 목록 조회 (검색/필터)' })
  @ApiSuccessResponse({ type: AdminApplicationListResponseDto })
  async getApplicationList(@Query() query: AdminApplicationListDto) {
    const result = await this.getAdminApplicationListQuery.execute(query);
    return ok<AdminApplicationListResponseDto>(
      result,
      'Success get application list',
    );
  }

  @Get(':userId/:retreatId')
  @ApiOperation({ summary: '[관리자] 수련회 신청자 상세 조회' })
  @ApiSuccessResponse({ type: AdminApplicationDetailResponseDto })
  @ApiFailureResponse(404, ERROR_MESSAGES.APPLICATION_NOT_FOUND)
  async getApplicationDetail(
    @Param('userId') userId: string,
    @Param('retreatId', ParseIntPipe) retreatId: number,
  ) {
    const application = await this.getApplicationDetailQuery.execute(
      userId,
      retreatId,
    );
    const result = AdminApplicationDetailMapper.toDto(application);
    return ok(result, 'Success get application detail');
  }

  @Patch(':applicationId')
  @ApiOperation({
    summary: '[관리자] 신청자 상세 정보 통합 수정',
    description:
      '식사, 교통, 결제, 체크인 중 전달한 필드만 변경 Swagger 하단 Examples 참고!',
  })
  @ApiBody({
    type: UpdateAdminApplicationRequestDto,
    description: '수정할 필드를 하나 이상 전달해야 함',
    examples: {
      meals: {
        summary: '식사 선택 변경',
        value: { retreatMealIds: [1, 2, 3] },
      },
      transports: {
        summary: '교통 선택 변경',
        value: {
          transports: [
            {
              retreatTransportId: 4,
              vehicleNumber: null,
              remark: null,
            },
          ],
        },
      },
      payment: {
        summary: '결제 상태 변경',
        value: { paymentStatus: 'PAID' },
      },
      checkIn: {
        summary: '체크인 상태 변경',
        value: { checkedIn: true },
      },
      combined: {
        summary: '여러 항목 동시 변경',
        value: {
          retreatMealIds: [1, 2, 3],
          transports: [{ retreatTransportId: 4 }],
          paymentStatus: 'PAID',
          checkedIn: true,
        },
      },
      clearSelections: {
        summary: '식사와 교통 선택 전체 해제',
        value: { retreatMealIds: [], transports: [] },
      },
    },
  })
  @ApiSuccessResponse({ type: AdminApplicationUpdateResponseDto })
  @ApiFailureResponse(404, ERROR_MESSAGES.APPLICATION_NOT_FOUND)
  @ApiFailureResponse(400, [
    ERROR_MESSAGES.APPLICATION_UPDATE_REQUIRED,
    ERROR_MESSAGES.INVALID_APPLICATION_MEAL_SELECTION,
    ERROR_MESSAGES.INVALID_APPLICATION_TRANSPORT_SELECTION,
    ERROR_MESSAGES.TRANSPORT_VEHICLE_NUMBER_REQUIRED,
    ERROR_MESSAGES.TRANSPORT_REMARK_REQUIRED,
  ])
  @ApiFailureResponse(
    409,
    ERROR_MESSAGES.CANCELED_APPLICATION_CHECK_IN_NOT_ALLOWED,
  )
  async updateApplication(
    @Param('applicationId', ParseIntPipe) applicationId: number,
    @Body() dto: UpdateAdminApplicationRequestDto,
  ) {
    const result = await this.updateAdminApplicationUseCase.execute(
      applicationId,
      {
        retreatMealIds: dto.retreatMealIds,
        transports: dto.transports?.map((transport) => ({
          retreatTransportId: transport.retreatTransportId,
          vehicleNumber: transport.vehicleNumber,
          remark: transport.remark,
        })),
        paymentStatus: dto.paymentStatus,
        checkedIn: dto.checkedIn,
      },
    );
    return ok(
      new AdminApplicationUpdateResponseDto(result),
      'Success update application',
    );
  }

  @Post('check-in')
  @ApiOperation({ summary: '[관리자] 체크인 확정 처리' })
  @ApiSuccessResponse({ type: CheckInResponseDto })
  @ApiFailureResponse(404, ERROR_MESSAGES.APPLICATION_NOT_FOUND)
  async adminCheckIn(@User() admin: UserEntity, @Body() dto: CheckInDto) {
    const result = await this.checkInApplicationUseCase.execute(
      dto.userId,
      dto.retreatId,
      admin.userId,
    );
    return ok<CheckInResponseDto>(result, 'Success check-in');
  }
}
