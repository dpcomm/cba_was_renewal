import {
  Body,
  Controller,
  Delete,
  Put,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ok } from '@shared/responses/api-response';
import { ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '@shared/decorators/jwt-guard.decorator';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { ApiFailureResponse } from '@shared/decorators/api-failure-response.decorator';
import { ExpoPushTokenService } from '@modules/expo-push-token/application/services/expo-push-token.service';
import { registExpoPushTokenRequestDto } from '@modules/expo-push-token/application/dto/expo-push-token.request.dto';
import { 
    ExpoPushTokenResponseDto, 
    ExpoPushTokenListResponse,
    ExpoPushTokenSingleResponse
} from '../dto/expo-push-token.response.dto';
import { ExpoPushTokenMapper } from '@modules/expo-push-token/application/mappers/expo-push-token.mapper';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';

@ApiTags('ExpoPushToken')
@Controller('expoPushToken')
@JwtGuard()
export class ExpoPushTokenController {
    constructor(
        private readonly expoPushTokenService: ExpoPushTokenService,
        private readonly mapper: ExpoPushTokenMapper,
    ) {}

    @Post('regist')
    @JwtGuard()
    @ApiSuccessResponse({ type: ExpoPushTokenResponseDto})
    @ApiFailureResponse(404, ERROR_MESSAGES.USER_NOT_FOUND)
    async regist(
        @Body() dto: registExpoPushTokenRequestDto,
    ) {
        const expoPushToken = await this.expoPushTokenService.registToken(dto);
        return ok<ExpoPushTokenResponseDto>(
            this.mapper.toResponse(expoPushToken),
            'Success regist ExpoPushToken',
        );
    }

}