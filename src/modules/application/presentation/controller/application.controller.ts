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

import { PlayEventDto } from '../dto/request/play-event.request.dto';
import { ApplicationDetailResponseDto } from '../dto/response/application-detail.response.dto';
import {
  CheckApplicationPaidResponseDto,
  CheckApplicationResponseDto,
} from '../dto/response/check-application.response.dto';
import { ApplicationHistoryResponseDto } from '../dto/response/application-history.response.dto';
import { PlayEventResponseDto } from '../dto/response/play-event.response.dto';
import { CheckMyApplicationQuery } from '@modules/application/application/queries/me/check-my-application.query';
import { CheckMyApplicationPaidQuery } from '@modules/application/application/queries/me/check-my-application-paid.query';
import { GetMyApplicationHistoryQuery } from '@modules/application/application/queries/me/get-my-application-history.query';
import { GetMyApplicationDetailQuery } from '@modules/application/application/queries/me/get-my-application-detail.query';
import { PlayEventUseCase } from '@modules/application/application/usecases/me/play-event.usecase';

@ApiTags('Application')
@Controller('application')
@JwtGuard()
export class ApplicationController {
  constructor(
    private readonly checkMyApplicationQuery: CheckMyApplicationQuery,
    private readonly checkMyApplicationPaidQuery: CheckMyApplicationPaidQuery,
    private readonly getMyApplicationHistoryQuery: GetMyApplicationHistoryQuery,
    private readonly getMyApplicationDetailQuery: GetMyApplicationDetailQuery,
    private readonly playEventUseCase: PlayEventUseCase,
  ) {}

  @Get('me/apply-check/:retreatId')
  @ApiOperation({ summary: '내 수련회 신청 여부 확인' })
  @ApiSuccessResponse({ type: CheckApplicationResponseDto })
  async checkApplication(
    @User() user: UserEntity,
    @Param('retreatId', ParseIntPipe) retreatId: number,
  ) {
    const result = await this.checkMyApplicationQuery.execute(
      user.userId,
      retreatId,
    );
    return ok<CheckApplicationResponseDto>(
      { isApplied: result },
      'Success check application',
    );
  }

  @Get('me/paid-check/:retreatId')
  @ApiOperation({ summary: '내 수련회 회비 납부 여부 확인' })
  @ApiSuccessResponse({ type: CheckApplicationPaidResponseDto })
  @ApiFailureResponse(404, ERROR_MESSAGES.APPLICATION_NOT_FOUND)
  async checkApplicationPaid(
    @User() user: UserEntity,
    @Param('retreatId', ParseIntPipe) retreatId: number,
  ) {
    const result = await this.checkMyApplicationPaidQuery.execute(
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
  async getMyApplicationHistory(@User() user: UserEntity) {
    const retreatIds = await this.getMyApplicationHistoryQuery.execute(
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
    const application = await this.getMyApplicationDetailQuery.execute(
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
    const result = await this.playEventUseCase.execute(
      user.userId,
      dto.retreatId,
    );
    return ok<PlayEventResponseDto>(result, 'Success play event');
  }
}
