import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ok } from '@shared/responses/api-response';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CreatePushNotificationDto,
  ReservePushNotificationDto,
} from './dto/response/push-notification-request.dto';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { ApiFailureResponse } from '@shared/decorators/api-failure-response.decorator';
import { ReservationPushNotificationResponseDto } from './dto/response/push-notification-response.dto';
import { NoticePushRequestDto } from './dto/request/notice-push-request.dto';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';
import { AdminGuard } from '@shared/decorators/admin-guard.decorator';
import { SendPushMessageUseCase } from '../application/usecases/send-push-message.usecase';
import { SendNoticePushUseCase } from '../application/usecases/send-notice-push.usecase';
import { ReservePushUseCase } from '../application/usecases/reserve-push.usecase';
import { CancelReservationUseCase } from '../application/usecases/cancel-reservation.usecase';
import { GetReservationsQuery } from '../application/queries/get-reservations.query';

@ApiTags('Admin - Push Notifications')
@Controller('admin/push-notification')
@AdminGuard()
export class PushNotificationAdminController {
  constructor(
    private readonly sendPushMessageUseCase: SendPushMessageUseCase,
    private readonly sendNoticePushUseCase: SendNoticePushUseCase,
    private readonly reservePushUseCase: ReservePushUseCase,
    private readonly cancelReservationUseCase: CancelReservationUseCase,
    private readonly getReservationsQuery: GetReservationsQuery,
  ) {}

  @Post()
  @ApiOperation({
    summary: '[관리자] 푸시 메세지 발송',
    description:
      '즉시 푸시를 발송한다. 공지와 무관한 단발성 메시지에 사용한다.',
  })
  @ApiSuccessResponse({})
  async create(@Body() dto: CreatePushNotificationDto) {
    await this.sendPushMessageUseCase.execute({
      title: dto.title,
      body: dto.body,
      target: dto.target,
      channelId: 'default',
    });

    return ok<null>(null, 'Success send push message');
  }

  @Post('reserve')
  @ApiOperation({
    summary: '[관리자] 푸시 메세지 예약',
    description: '예약 시각에 맞춰 푸시를 발송한다.',
  })
  @ApiSuccessResponse({ type: ReservationPushNotificationResponseDto })
  async reserve(@Body() dto: ReservePushNotificationDto) {
    const notification = await this.reservePushUseCase.execute({
      title: dto.title,
      body: dto.body,
      reserveTime: dto.reserveTime,
      target: dto.target,
    });

    return ok<ReservationPushNotificationResponseDto>(
      notification,
      'Success reserve push notification',
    );
  }

  @Get('reservation')
  @ApiOperation({
    summary: '[관리자] 예약된 푸시 메세지 확인',
    description: '현재 등록된 예약 푸시 목록을 조회한다.',
  })
  @ApiSuccessResponse({
    type: ReservationPushNotificationResponseDto,
    isArray: true,
  })
  async getReservations() {
    const notifications = await this.getReservationsQuery.execute();

    return ok<ReservationPushNotificationResponseDto[]>(
      notifications,
      'Success get reservation list',
    );
  }

  @Delete('cancel/:id')
  @ApiOperation({
    summary: '[관리자] 예약된 푸시 메세지 취소',
    description: '예약된 푸시를 취소한다.',
  })
  @ApiSuccessResponse({ type: ReservationPushNotificationResponseDto })
  async cancelReservation(@Param('id', ParseIntPipe) reservationId: number) {
    const notification =
      await this.cancelReservationUseCase.execute(reservationId);

    return ok<ReservationPushNotificationResponseDto>(
      notification,
      'Success cancel push notification',
    );
  }

  @Post('notice/:id')
  @ApiOperation({
    summary: '[관리자] 공지 푸시 발송/예약',
    description: 'Notice에 저장된 공지 내용을 기반으로 푸시를 발송/예약한다.',
  })
  @ApiSuccessResponse({})
  @ApiFailureResponse(404, ERROR_MESSAGES.NOTICE_NOT_FOUND)
  async sendNoticePush(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: NoticePushRequestDto,
  ) {
    await this.sendNoticePushUseCase.execute(id, {
      target: dto.target,
      reserveTime: dto.reserveTime,
      includeBody: dto.includeBody,
    });

    if (dto.reserveTime) {
      return ok<null>(null, 'Success reserve notice push');
    }

    return ok<null>(null, 'Success send notice push');
  }
}
