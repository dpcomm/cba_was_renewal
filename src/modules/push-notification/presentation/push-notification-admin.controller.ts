import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ok } from '@shared/responses/api-response';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  PUSH_SENDER_PORT,
  IPushSenderPort,
} from '@modules/push-notification/application/ports/push-sender.port';
import {
  CreatePushNotificationDto,
  ReservePushNotificationDto,
} from './dto/response/push-notification-request.dto';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { ApiFailureResponse } from '@shared/decorators/api-failure-response.decorator';
import { PushTokenService } from '@modules/push-token/application/push-token.service';
import { ReservationPushNotificationResponseDto } from './dto/response/push-notification-response.dto';
import { NoticePushRequestDto } from './dto/request/notice-push-request.dto';
import { NoticePushService } from '@modules/push-notification/application/notice-push.service';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';
import { AdminGuard } from '@shared/decorators/admin-guard.decorator';

@ApiTags('Admin - Push Notifications')
@Controller('admin/push-notification')
@AdminGuard()
export class PushNotificationAdminController {
  constructor(
    @Inject(PUSH_SENDER_PORT)
    private readonly pushSender: IPushSenderPort,
    private readonly pushTokenService: PushTokenService,
    private readonly noticePushService: NoticePushService,
  ) {}

  @Post()
  @ApiOperation({
    summary: '[관리자] 푸시 메세지 발송',
    description:
      '즉시 푸시를 발송한다. 공지와 무관한 단발성 메시지에 사용한다.',
  })
  @ApiSuccessResponse({})
  async create(@Body() dto: CreatePushNotificationDto) {
    const tokens = await this.pushTokenService.getTokens(dto.target);

    await this.pushSender.send(tokens, {
      title: dto.title,
      body: dto.body,
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
    const notification = await this.pushSender.reserve({
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
    const notifications = await this.pushSender.getReservations();

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
    const notification = await this.pushSender.cancelReservation(reservationId);

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
    await this.noticePushService.sendNoticePush(id, {
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
