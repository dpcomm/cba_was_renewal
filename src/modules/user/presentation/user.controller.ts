import { Body, Controller, Delete, Get, Patch, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { JwtGuard } from '@shared/decorators/jwt-guard.decorator';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { ApiFailureResponse } from '@shared/decorators/api-failure-response.decorator';
import { UserResponseDto } from './dto/response/user.response.dto';
import { ok } from '@shared/responses/api-response';
import { UpdateUserDto } from './dto/request/update-user.request.dto';
import { UpdateEmailDto } from './dto/request/update-email.request.dto';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';
import { GetUserQuery } from '../application/queries/get-user.query';
import { UpdateUserProfileUseCase } from '../application/usecases/update-user-profile.usecase';
import { UpdateUserEmailUseCase } from '../application/usecases/update-user-email.usecase';
import { DeleteAccountUseCase } from '../application/usecases/delete-account.usecase';

@ApiTags('Users')
@Controller('users')
@JwtGuard()
export class UserController {
  constructor(
    private readonly getUserQuery: GetUserQuery,
    private readonly updateUserProfile: UpdateUserProfileUseCase,
    private readonly updateUserEmail: UpdateUserEmailUseCase,
    private readonly deleteAccountUseCase: DeleteAccountUseCase,
  ) {}

  @Get('me')
  @ApiOperation({ summary: '내 정보 조회' })
  @ApiSuccessResponse({ type: UserResponseDto })
  @ApiFailureResponse(404, ERROR_MESSAGES.USER_NOT_FOUND)
  async getProfile(@Req() req) {
    const user = await this.getUserQuery.byId(req.user.id);
    return ok(new UserResponseDto(user), 'Success fetch profile');
  }

  @Patch('me')
  @ApiOperation({ summary: '내 정보 수정' })
  @ApiSuccessResponse({ type: UserResponseDto })
  @ApiFailureResponse(404, ERROR_MESSAGES.USER_NOT_FOUND)
  async updateUser(@Req() req, @Body() dto: UpdateUserDto) {
    const user = await this.updateUserProfile.execute(req.user.id, dto);
    return ok(new UserResponseDto(user), 'Success update profile');
  }

  @Patch('me/email')
  @ApiOperation({ summary: '이메일 등록/변경 (인증 필요)' })
  @ApiSuccessResponse({ type: UserResponseDto })
  @ApiFailureResponse(400, ERROR_MESSAGES.EMAIL_VERIFICATION_CODE_INVALID)
  @ApiFailureResponse(400, ERROR_MESSAGES.EMAIL_VERIFICATION_CODE_EXPIRED)
  @ApiFailureResponse(404, ERROR_MESSAGES.USER_NOT_FOUND)
  @ApiBody({ type: UpdateEmailDto })
  async updateEmail(@Req() req, @Body() dto: UpdateEmailDto) {
    const user = await this.updateUserEmail.execute(req.user.id, dto);
    return ok(new UserResponseDto(user), 'Success update email');
  }

  @Delete('me')
  @ApiOperation({ summary: '회원 탈퇴' })
  @ApiSuccessResponse({})
  @ApiFailureResponse(404, ERROR_MESSAGES.USER_NOT_FOUND)
  async deleteAccount(@Req() req) {
    await this.deleteAccountUseCase.execute(req.user.id);
    return ok(null, 'Success delete account');
  }
}
