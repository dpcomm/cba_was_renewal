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
import { ExpoNotificationService } from '@modules/push-notification/application/services/expo-notification/ExpoNotification.service';
import {
  createPushNotificationRequestDto,
  reservePushNotificationRequestDto,
} from '@modules/push-notification/application/dto/push-notification.request.dto';
import { JwtGuard } from '@shared/decorators/jwt-guard.decorator';
import { RankGuard } from '@shared/decorators/rank-guard.decorator';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { ApiFailureResponse } from '@shared/decorators/api-failure-response.decorator';
import { ExpoPushTokenService } from '@modules/expo-push-token/application/services/expo-push-token.service';
import { defaultNotificationDto } from '@modules/push-notification/application/dto/notification.dto';
import { UserRank } from '@modules/user/domain/enums/user-rank.enum';
import { reservationPushNotificationResponseDto } from '../dto/push-notification.response.dto';
import { noticePushRequestDto } from '@modules/push-notification/application/dto/notice-push.request.dto';
import { NoticePushService } from '@modules/push-notification/application/services/notice-push.service';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';

@ApiTags('PushNotification')
@Controller('pushNotification')
@JwtGuard()
export class PushNofiticationController {
  constructor(
    private readonly expoService: ExpoNotificationService,
    private readonly expoTokenService: ExpoPushTokenService,
    private readonly noticePushService: NoticePushService,
  ) {}

  @Post()
  @RankGuard(UserRank.ADMIN)
  @JwtGuard()
  @ApiOperation({
    summary: '푸시 메세지 발송',
    description: '즉시 푸시를 발송한다. 공지와 무관한 단발성 메시지에 사용한다.',
  })
  @ApiSuccessResponse({})
  async create(@Body() dto: createPushNotificationRequestDto) {
    const tokens = await this.expoTokenService.getTokens(dto.target);

    const notification = new defaultNotificationDto(dto.title, dto.body);

    await this.expoService.send(tokens, notification);

    return ok<null>(null, 'Success send push message');
  }

  @Post('reserve')
  @RankGuard(UserRank.ADMIN)
  @JwtGuard()
  @ApiOperation({
    summary: '푸시 메세지 예약',
    description: '예약 시각에 맞춰 푸시를 발송한다.',
  })
  @ApiSuccessResponse({ type: reservationPushNotificationResponseDto })
  async reserve(@Body() dto: reservePushNotificationRequestDto) {
    const notification = await this.expoService.reserve(dto);

    return ok<reservationPushNotificationResponseDto>(
      notification,
      'Success reserve push notification',
    );
  }

  @Get('reservation')
  @RankGuard(UserRank.ADMIN)
  @JwtGuard()
  @ApiOperation({
    summary: '예약된 푸시 메세지 확인',
    description: '현재 등록된 예약 푸시 목록을 조회한다.',
  })
  @ApiSuccessResponse({
    type: reservationPushNotificationResponseDto,
    isArray: true,
  })
  async getReservations() {
    const notifications = await this.expoService.getReservations();

    return ok<reservationPushNotificationResponseDto[]>(
      notifications,
      'Success get reservation list',
    );
  }

  @Delete('cancel/:id')
  @RankGuard(UserRank.ADMIN)
  @JwtGuard()
  @ApiOperation({
    summary: '예약된 푸시 메세지 취소',
    description: '예약된 푸시를 취소한다.',
  })
  @ApiSuccessResponse({ type: reservationPushNotificationResponseDto })
  async cancelReservation(@Param('id', ParseIntPipe) reservationId: number) {
    const notification =
      await this.expoService.cancelReservation(reservationId);

    return ok<reservationPushNotificationResponseDto>(
      notification,
      'Success cancel push notification',
    );
  }

  @Post('notice/:id')
  @RankGuard(UserRank.ADMIN)
  @JwtGuard()
  @ApiOperation({
    summary: '공지 푸시 발송/예약',
    description: 'Notice에 저장된 공지 내용을 기반으로 푸시를 발송/예약한다.',
  })
  @ApiSuccessResponse({})
  @ApiFailureResponse(404, ERROR_MESSAGES.NOTICE_NOT_FOUND)
  async sendNoticePush(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: noticePushRequestDto,
  ) {
    await this.noticePushService.sendNoticePush(id, dto);

    if (dto.reserveTime) {
      return ok<null>(null, 'Success reserve notice push');
    }

    return ok<null>(null, 'Success send notice push');
  }
}
