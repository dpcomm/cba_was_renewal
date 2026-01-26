import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ok } from '@shared/responses/api-response';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '@shared/decorators/jwt-guard.decorator';
import { RankGuard } from '@shared/decorators/rank-guard.decorator';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { ApiFailureResponse } from '@shared/decorators/api-failure-response.decorator';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';
import { User } from '@shared/decorators/user.decorator';
import { User as UserEntity } from '@modules/user/domain/entities/user.entity';
import { UserRank } from '@modules/user/domain/enums/user-rank.enum';

import { ApplicationService } from '@modules/application/application/services/application.service';
import { CheckInDto } from '../dto/check-in.dto';
import { PlayEventDto } from '../dto/play-event.dto';
import { AdminScanResponseDto } from '../dto/admin-scan.response.dto';
import { EventResult } from '@modules/application/domain/enum/application.enum';

@ApiTags('Application')
@Controller('application')
@JwtGuard()
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Get('check/:userId/:retreatId')
  @ApiOperation({ summary: '수련회 신청 여부 확인' })
  @ApiSuccessResponse({})
  async checkApplication(
    @Param('userId') userId: string,
    @Param('retreatId', ParseIntPipe) retreatId: number,
  ) {
    const result = await this.applicationService.checkApplication(
      userId,
      retreatId,
    );
    return ok<boolean>(result, 'Success check application');
  }

  @Get('check/paid/:userId/:retreatId')
  @ApiOperation({ summary: '수련회 회비 납부 여부 확인' })
  @ApiSuccessResponse({})
  @ApiFailureResponse(404, ERROR_MESSAGES.APPLICATION_NOT_FOUND)
  async checkApplicationPaid(
    @Param('userId') userId: string,
    @Param('retreatId', ParseIntPipe) retreatId: number,
  ) {
    const result = await this.applicationService.checkApplicatinoPaid(
      userId,
      retreatId,
    );
    return ok<boolean>(result, 'Success check application paid');
  }

  @Get(':userId')
  @ApiOperation({ summary: '수련회 히스토리 조회' })
  @ApiSuccessResponse({})
  async getApplicationsByUserId(@Param('userId') userId: string) {
    const retreatIds =
      await this.applicationService.getApplicationsByUserId(userId);
    return ok<number[]>(retreatIds, 'Success get retreat id list');
  }

  @Get('me/:retreatId')
  @ApiOperation({ summary: '내 수련회 등록 정보 상세 조회' })
  @ApiSuccessResponse({})
  @ApiFailureResponse(404, ERROR_MESSAGES.APPLICATION_NOT_FOUND)
  async getMyApplicationDetail(
    @User() user: UserEntity,
    @Param('retreatId', ParseIntPipe) retreatId: number,
  ) {
    const application = await this.applicationService.getApplicationDetail(
      user.userId,
      retreatId,
    );
    return ok(application, 'Success get my application detail');
  }

  @Get('admin/scan/:userId/:retreatId')
  @RankGuard(UserRank.ADMIN)
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

  @Post('admin/check-in')
  @RankGuard(UserRank.ADMIN)
  @ApiOperation({ summary: '[관리자] 체크인 확정 처리' })
  @ApiSuccessResponse({})
  @ApiFailureResponse(404, ERROR_MESSAGES.APPLICATION_NOT_FOUND)
  async adminCheckIn(@User() admin: UserEntity, @Body() dto: CheckInDto) {
    const result = await this.applicationService.checkIn(
      dto.userId,
      dto.retreatId,
      admin.userId,
    );
    return ok(result, 'Success check-in');
  }

  @Post('event')
  @ApiOperation({ summary: '웰컴 이벤트 참여 (체크인 후 가능)' })
  @ApiSuccessResponse({})
  @ApiFailureResponse(403, '체크인 후 이벤트 참여가 가능합니다.')
  @ApiFailureResponse(409, '이미 이벤트에 참여하셨습니다.')
  async playEvent(@User() user: UserEntity, @Body() dto: PlayEventDto) {
    const result = await this.applicationService.playEvent(
      user.userId,
      dto.retreatId,
    );
    return ok<{ eventResult: EventResult }>(result, 'Success play event');
  }
}
