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
import { createPushNotificationRequestDto } from '@modules/push-notification/application/dto/push-notification.request.dto';
import { JwtGuard } from '@shared/decorators/jwt-guard.decorator';
import { RankGuard } from '@shared/decorators/rank-guard.decorator';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { ApiFailureResponse } from '@shared/decorators/api-failure-response.decorator';
import { ExpoPushTokenService } from '@modules/expo-push-token/application/services/expo-push-token.service';
import { defaultNotificationDto } from '@modules/push-notification/application/dto/notification.dto';
import { UserRank } from '@modules/user/domain/enums/user-rank.enum';

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
}