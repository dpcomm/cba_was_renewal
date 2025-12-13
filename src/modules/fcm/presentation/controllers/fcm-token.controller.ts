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
import { Platform } from '@modules/fcm/domain/platform.enum';
import { FcmTokenService } from '@modules/fcm/application/services/fcm-token.service';
import { 
  registFcmTokenRequestDto, 
  unregistFcmTokenRequestDto, 
  deleteFcmTokenRequestDto, 
  refreshFcmTokenRequestDto 
} from '@modules/fcm/application/dto/fcm-token.request.dto';
import { 
  FcmTokenResponseDto, 
  FcmTokenRefreshResponse, 
  FcmTokenSingleResponse 
} from '../dto/fcm-token.response.dto';
import { FcmTokenMapper } from '@modules/fcm/application/mappers/fcm-token.mapper';

@ApiTags('FcmToken')
@Controller('fcmToken')
@JwtGuard()
export class FcmTokenController {
  constructor(
    private readonly fcmTokenService: FcmTokenService,
    private readonly mapper: FcmTokenMapper,
  ) {}

  @Post('regist')
  @JwtGuard()
  @ApiSuccessResponse({ type: FcmTokenResponseDto})
  async regist(
    @Body() dto: registFcmTokenRequestDto,
  ) {
    const fcmToken = await this.fcmTokenService.registToken(dto);
    return ok<FcmTokenResponseDto>(
      this.mapper.toResponse(fcmToken),
      'Success regist FcmToken',
    );
  }

  @Put('unregist')
  @JwtGuard()
  async unregist(
    @Body() dto: unregistFcmTokenRequestDto
  ) {
    await this.fcmTokenService.unregistToken(dto);
    return ok<null>(null, 'Success unregist FcmToken');
  }

  // 현재 refresh의 반환 타입을 새로운 newToken만 반환.
  // oldToken 필요시 변경예정.
  @Put('refresh')
  @JwtGuard()
  @ApiSuccessResponse({ type: FcmTokenResponseDto})
  async refresh(
    @Body() dto: refreshFcmTokenRequestDto
  ) {
    const refreshTokens = await this.fcmTokenService.refreshToken(dto);
    return ok<FcmTokenResponseDto>(
      this.mapper.toResponse(refreshTokens.newToken),
      'Success refresh FcmToken',
    );
  }

  @Delete('delete')
  @JwtGuard()
  @ApiFailureResponse(404, 'FcmToken not found')
  async delete(
    @Body() dto: deleteFcmTokenRequestDto
  ) {
    await this.fcmTokenService.deleteToken(dto);
    return ok<null>(null, 'Success delete FcmToken');
  }
   
}