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
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { ApiFailureResponse } from '@shared/decorators/api-failure-response.decorator';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';
import { User } from '@shared/decorators/user.decorator';
import { User as UserEntity } from '@modules/user/domain/entities/user.entity';

import { ApplicationService } from '@modules/application/application/services/application.service';
import { PlayEventDto } from '../dto/play-event.dto';
import { ApplicationDetailResponseDto } from '../dto/application-detail.response.dto';
import {
  CheckApplicationPaidResponseDto,
  CheckApplicationResponseDto,
} from '../dto/check-application.response.dto';
import { ApplicationHistoryResponseDto } from '../dto/application-history.response.dto';
import { PlayEventResponseDto } from '../dto/play-event.response.dto';

@ApiTags('Application')
@Controller('application')
@JwtGuard()
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Get('check/:userId/:retreatId')
  @ApiOperation({ summary: '수련회 신청 여부 확인' })
  @ApiSuccessResponse({ type: CheckApplicationResponseDto })
  async checkApplication(
    @Param('userId') userId: string,
    @Param('retreatId', ParseIntPipe) retreatId: number,
  ) {
    const result = await this.applicationService.checkApplication(
      userId,
      retreatId,
    );
    return ok<CheckApplicationResponseDto>(
      { isApplied: result },
      'Success check application',
    );
  }

  @Get('me/paid/:retreatId')
  @ApiOperation({ summary: '내 수련회 회비 납부 여부 확인' })
  @ApiSuccessResponse({ type: CheckApplicationPaidResponseDto })
  @ApiFailureResponse(404, ERROR_MESSAGES.APPLICATION_NOT_FOUND)
  async checkApplicationPaid(
    @User() user: UserEntity,
    @Param('retreatId', ParseIntPipe) retreatId: number,
  ) {
    const result = await this.applicationService.checkApplicatinoPaid(
      user.userId,
      retreatId,
    );
    return ok<CheckApplicationPaidResponseDto>(
      { isPaid: result },
      'Success check application paid',
    );
  }

  @Get('me/history')
  @ApiOperation({ summary: '내 수련회 히스토리 조회' })
  @ApiSuccessResponse({ type: ApplicationHistoryResponseDto })
  async getApplicationsByUserId(@User() user: UserEntity) {
    const retreatIds = await this.applicationService.getApplicationsByUserId(
      user.userId,
    );
    return ok<ApplicationHistoryResponseDto>(
      { retreatIds },
      'Success get retreat id list',
    );
  }

  @Get('me/:retreatId')
  @ApiOperation({ summary: '내 수련회 등록 정보 상세 조회' })
  @ApiSuccessResponse({ type: ApplicationDetailResponseDto })
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

  @Post('event')
  @ApiOperation({ summary: '웰컴 이벤트 참여 (체크인 후 가능)' })
  @ApiSuccessResponse({ type: PlayEventResponseDto })
  @ApiFailureResponse(403, '체크인 후 이벤트 참여가 가능합니다.')
  @ApiFailureResponse(409, '이미 이벤트에 참여하셨습니다.')
  async playEvent(@User() user: UserEntity, @Body() dto: PlayEventDto) {
    const result = await this.applicationService.playEvent(
      user.userId,
      dto.retreatId,
    );
    return ok<PlayEventResponseDto>(result, 'Success play event');
  }
}
