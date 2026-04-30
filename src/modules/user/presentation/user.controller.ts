import { Body, Controller, Delete, Get, Patch, Query, Req } from '@nestjs/common';
import { UserService } from '../application/user.service';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { JwtGuard } from '@shared/decorators/jwt-guard.decorator';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { UserResponseDto } from './dto/user.response.dto';
import { ok } from '@shared/responses/api-response';
import { UpdateUserDto } from '../application/dto/update-user.dto';
import { UpdateEmailDto } from '../application/dto/update-email.dto';
import { ApiFailureResponse } from '@shared/decorators/api-failure-response.decorator';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';
import { RankGuard } from '@shared/decorators/rank-guard.decorator';
import { UserRank } from '@modules/user/domain/enums/user-rank.enum';
import { UserSearchListResponse, UserSearchResponseDto } from './dto/user.search.response.dto';

@ApiTags('Users')
@Controller('users')
@JwtGuard()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: '내 정보 조회' })
  @ApiSuccessResponse({ type: UserResponseDto })
  @ApiFailureResponse(404, ERROR_MESSAGES.USER_NOT_FOUND)
  async getProfile(@Req() req) {
    const user = await this.userService.findOneById(req.user.id);
    return ok(new UserResponseDto(user), 'Success fetch profile');
  }

  @Patch('me')
  @ApiOperation({ summary: '내 정보 수정' })
  @ApiSuccessResponse({ type: UserResponseDto })
  @ApiFailureResponse(404, ERROR_MESSAGES.USER_NOT_FOUND)
  async updateUser(@Req() req, @Body() dto: UpdateUserDto) {
    const user = await this.userService.updateUser(req.user.id, dto);
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
    const user = await this.userService.updateEmail(req.user.id, dto);
    return ok(new UserResponseDto(user), 'Success update email');
  }

  @Delete('me')
  @ApiOperation({ summary: '회원 탈퇴' })
  @ApiSuccessResponse({})
  @ApiFailureResponse(404, ERROR_MESSAGES.USER_NOT_FOUND)
  async deleteAccount(@Req() req) {
    await this.userService.deleteAccount(req.user.id);
    return ok(null, 'Success delete account');
  }

  @Get('search')
  @RankGuard(UserRank.ADMIN)
  @ApiOperation({ summary: '이름으로 사용자 검색' })
  @ApiSuccessResponse({ type: UserSearchResponseDto, isArray: true })
  async searchUsers(@Query('name') name: string) {
    const users = await this.userService.searchUsersByName(name ?? '');
    const payload = users.map((user) => ({
      id: user.id,
      name: user.name,
      group: user.group,
      phone: user.phone,
    }));
    return ok<UserSearchListResponse>(payload, 'Success search users');
  }
}
