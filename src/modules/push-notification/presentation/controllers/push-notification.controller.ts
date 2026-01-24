import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ok } from '@shared/responses/api-response';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ExpoNotificationService } from '@modules/push-notification/application/services/expo-notification/ExpoNotification.service';
import { createPushNotificationRequestDto, reservePushNotificationRequestDto } from '@modules/push-notification/application/dto/push-notification.request.dto';
import { JwtGuard } from '@shared/decorators/jwt-guard.decorator';
import { RankGuard } from '@shared/decorators/rank-guard.decorator';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { ApiFailureResponse } from '@shared/decorators/api-failure-response.decorator';
import { ExpoPushTokenService } from '@modules/expo-push-token/application/services/expo-push-token.service';
import { defaultNotificationDto } from '@modules/push-notification/application/dto/notification.dto';
import { UserRank } from '@modules/user/domain/enums/user-rank.enum';
import { reservationPushNotificationResponseDto } from '../dto/push-notification.response.dto';

@ApiTags('PushNotification')
@Controller('pushNotification')
@JwtGuard()
export class PushNofiticationController {
    constructor(
        private readonly expoService: ExpoNotificationService,
        private readonly expoTokenService: ExpoPushTokenService
    ) {}

    @Post()
    @JwtGuard()
    @RankGuard(UserRank.ADMIN)
    @ApiOperation({ summary: '푸시 메세지 발송' })
    @ApiSuccessResponse({})
    async create(
        @Body() dto: createPushNotificationRequestDto
    ) {
        const tokens = await this.expoTokenService.getTokens(dto.target);

        const notification = new defaultNotificationDto(dto.title, dto.body);

        await this.expoService.send(tokens, notification);

        return ok<null>(
            null,
            'Success send push message'
        )
    }

    @Post('reserve')
    @JwtGuard()
    @RankGuard(UserRank.ADMIN)
    @ApiOperation({ summary: '푸시 메세지 예약'})
    @ApiSuccessResponse({type: reservationPushNotificationResponseDto})
    async reserve(
        @Body() dto: reservePushNotificationRequestDto
    ) {
        const notification = await this.expoService.reserve(dto);

        return ok<reservationPushNotificationResponseDto>(
            notification,
            'Success reserve push notification'
        );
    }

    @Get('reservation')
    @JwtGuard()
    @RankGuard(UserRank.ADMIN)
    @ApiOperation({summary: '예약된 푸시 메세지 확인'})
    @ApiSuccessResponse({type: reservationPushNotificationResponseDto, isArray: true})
    async getReservations() {
        const notifications = await this.expoService.getReservations();

        return ok<reservationPushNotificationResponseDto[]>(
            notifications,
            'Success get reservation list'
        );
    }

    @Delete('cancel/:id')
    @JwtGuard()
    @RankGuard(UserRank.ADMIN)
    @ApiOperation({summary: '예약된 푸시 메세지 취소'})
    @ApiSuccessResponse({type: reservationPushNotificationResponseDto})
    async cancelReservation(
        @Param('id', ParseIntPipe) reservationId: number,
    ) {
        const notification = await this.expoService.cancelReservation(reservationId);

        return ok<reservationPushNotificationResponseDto>(
            notification,
            'Success cancel push notification'
        );
    }
}