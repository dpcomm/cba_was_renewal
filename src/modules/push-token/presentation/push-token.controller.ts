import { Body, Controller, Post } from '@nestjs/common';
import { ok } from '@shared/responses/api-response';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '@shared/decorators/jwt-guard.decorator';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { ApiFailureResponse } from '@shared/decorators/api-failure-response.decorator';
import { User as AuthUser } from '@shared/decorators/user.decorator';
import {
  RegisterPushTokenDto,
  DeletePushTokenDto,
} from './dto/request/push-token-request.dto';
import { PushTokenResponseDto } from './dto/response/push-token-response.dto';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';
import { RegisterPushTokenUseCase } from '../application/usecases/register-push-token.usecase';
import { DeletePushTokenUseCase } from '../application/usecases/delete-push-token.usecase';

@ApiTags('PushToken')
@Controller('push-token')
@JwtGuard()
export class PushTokenController {
  constructor(
    private readonly registerPushTokenUseCase: RegisterPushTokenUseCase,
    private readonly deletePushTokenUseCase: DeletePushTokenUseCase,
  ) {}

  @Post('regist')
  @JwtGuard()
  @ApiOperation({ summary: '푸시 토큰 등록' })
  @ApiSuccessResponse({ type: PushTokenResponseDto })
  @ApiFailureResponse(404, ERROR_MESSAGES.USER_NOT_FOUND)
  async regist(
    @AuthUser() user: { id: number; userId: string; rank: string },
    @Body() dto: RegisterPushTokenDto,
  ) {
    const pushToken = await this.registerPushTokenUseCase.execute(
      user.id,
      dto.token,
    );
    return ok<PushTokenResponseDto>(
      new PushTokenResponseDto(pushToken),
      'Success regist PushToken',
    );
  }

  @Post('delete')
  @JwtGuard()
  @ApiOperation({ summary: '푸시 토큰 삭제' })
  @ApiSuccessResponse({})
  async delete(@Body() dto: DeletePushTokenDto) {
    await this.deletePushTokenUseCase.execute(dto.token);
    return ok<null>(null, 'Success delete PushToken');
  }
}
