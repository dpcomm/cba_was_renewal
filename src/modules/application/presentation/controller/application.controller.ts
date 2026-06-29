import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
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
import { GetApplicationOptionsQuery } from '@modules/application/application/queries/get-application-options.query';
import { ApplicationOptionsResponseDto } from '../dto/response/application-options.response.dto';
import { GetApplicationFormQuery } from '@modules/application/application/queries/get-application-form.query';
import { ApplicationFormResponseDto } from '../dto/response/application-form.response.dto';
import { UpsertMyApplicationRequestDto } from '../dto/request/upsert-my-application.request.dto';
import { UpsertMyApplicationUseCase } from '@modules/application/application/usecases/me/upsert-my-application.usecase';
import { UpsertMyApplicationResponseDto } from '../dto/response/upsert-my-application.response.dto';
import { DeleteMyApplicationUseCase } from '@modules/application/application/usecases/me/delete-my-application.usecase';
import { DeleteMyApplicationResponseDto } from '../dto/response/delete-my-application.response.dto';

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
    private readonly getApplicationOptionsQuery: GetApplicationOptionsQuery,
    private readonly getApplicationFormQuery: GetApplicationFormQuery,
    private readonly upsertMyApplicationUseCase: UpsertMyApplicationUseCase,
    private readonly deleteMyApplicationUseCase: DeleteMyApplicationUseCase,
  ) {}

  @Get('form')
  @ApiOperation({
    summary: '현재 수련회 신청서 양식 조회',
    description:
      'SystemConfig.currentRetreatId 기준으로 신청서 질문, 식사/교통 옵션, 내 기존 신청 값을 한 번에 조회합니다.',
  })
  @ApiSuccessResponse({ type: ApplicationFormResponseDto })
  @ApiFailureResponse(404, [
    ERROR_MESSAGES.CURRENT_RETREAT_NOT_FOUND,
    ERROR_MESSAGES.APPLICATION_FORM_NOT_FOUND,
  ])
  async getCurrentApplicationForm(@User() user: UserEntity) {
    const result = await this.getApplicationFormQuery.execute(user.userId);
    return ok(
      new ApplicationFormResponseDto(result),
      'Success get application form',
    );
  }

  @Get('form/:retreatId')
  @ApiOperation({
    summary: '수련회 신청서 양식 조회',
    description:
      '지정한 수련회의 신청서 질문, 식사/교통 옵션, 내 기존 신청 값을 한 번에 조회합니다.',
  })
  @ApiSuccessResponse({ type: ApplicationFormResponseDto })
  @ApiFailureResponse(404, [
    ERROR_MESSAGES.RETREAT_NOT_FOUND,
    ERROR_MESSAGES.APPLICATION_FORM_NOT_FOUND,
  ])
  async getApplicationForm(
    @User() user: UserEntity,
    @Param('retreatId', ParseIntPipe) retreatId: number,
  ) {
    const result = await this.getApplicationFormQuery.execute(
      user.userId,
      retreatId,
    );
    return ok(
      new ApplicationFormResponseDto(result),
      'Success get application form',
    );
  }

  @Get('options/:retreatId')
  @ApiOperation({
    summary: '수련회 신청 화면 옵션 조회',
    description:
      '소속 중그룹, 식사 슬롯, 출발/복귀 교통 옵션을 수련회 기준으로 조회합니다.',
  })
  @ApiSuccessResponse({ type: ApplicationOptionsResponseDto })
  @ApiFailureResponse(404, ERROR_MESSAGES.RETREAT_NOT_FOUND)
  async getApplicationOptions(
    @Param('retreatId', ParseIntPipe) retreatId: number,
  ) {
    const result = await this.getApplicationOptionsQuery.execute(retreatId);
    return ok(
      new ApplicationOptionsResponseDto(result),
      'Success get application options',
    );
  }

  @Put('me/:retreatId')
  @ApiOperation({
    summary: '내 수련회 신청 저장/수정',
    description:
      '신청이 없으면 생성하고, 이미 있으면 식사/교통/답변 선택을 전체 교체합니다.',
  })
  @ApiSuccessResponse({ type: UpsertMyApplicationResponseDto })
  @ApiFailureResponse(400, [
    ERROR_MESSAGES.APPLICATION_PERIOD_CLOSED,
    ERROR_MESSAGES.INVALID_APPLICATION_MEAL_SELECTION,
    ERROR_MESSAGES.INVALID_APPLICATION_TRANSPORT_SELECTION,
    ERROR_MESSAGES.INVALID_APPLICATION_ANSWER,
    ERROR_MESSAGES.REQUIRED_APPLICATION_ANSWER_MISSING,
  ])
  @ApiFailureResponse(404, [
    ERROR_MESSAGES.RETREAT_NOT_FOUND,
    ERROR_MESSAGES.APPLICATION_FORM_NOT_FOUND,
  ])
  @ApiFailureResponse(
    409,
    ERROR_MESSAGES.CHECKED_IN_APPLICATION_UPDATE_NOT_ALLOWED,
  )
  async upsertMyApplication(
    @User() user: UserEntity,
    @Param('retreatId', ParseIntPipe) retreatId: number,
    @Body() dto: UpsertMyApplicationRequestDto,
  ) {
    const result = await this.upsertMyApplicationUseCase.execute(
      user.userId,
      retreatId,
      {
        group: dto.group,
        surveyId: dto.surveyId,
        retreatMealIds: dto.retreatMealIds,
        transports: dto.transports,
        answers: dto.answers,
      },
    );
    return ok(
      new UpsertMyApplicationResponseDto(result),
      'Success upsert application',
    );
  }

  @Delete('me/:retreatId')
  @ApiOperation({
    summary: '내 수련회 신청 취소',
    description:
      '내 신청을 CANCELED 상태로 소프트 삭제합니다. 식사/교통/답변 선택은 보존하며, 체크인된 신청은 취소할 수 없습니다.',
  })
  @ApiSuccessResponse({ type: DeleteMyApplicationResponseDto })
  @ApiFailureResponse(404, ERROR_MESSAGES.APPLICATION_NOT_FOUND)
  @ApiFailureResponse(
    409,
    ERROR_MESSAGES.CHECKED_IN_APPLICATION_DELETE_NOT_ALLOWED,
  )
  async deleteMyApplication(
    @User() user: UserEntity,
    @Param('retreatId', ParseIntPipe) retreatId: number,
  ) {
    const result = await this.deleteMyApplicationUseCase.execute(
      user.userId,
      retreatId,
    );
    return ok(
      new DeleteMyApplicationResponseDto(result),
      'Success cancel application',
    );
  }

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
