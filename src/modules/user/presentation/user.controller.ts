import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../application/user.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtGuard } from '@shared/decorators/jwt-guard.decorator';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { UserResponseDto } from './dto/user.response.dto';
import { ok } from '@shared/responses/api-response';
import { UpdateUserDto } from '../application/dto/update-user.dto';
import { ApiFailureResponse } from '@shared/decorators/api-failure-response.decorator';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtGuard)
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

  @Delete('me')
  @ApiOperation({ summary: '회원 탈퇴' })
  @ApiSuccessResponse({})
  @ApiFailureResponse(404, ERROR_MESSAGES.USER_NOT_FOUND)
  async deleteAccount(@Req() req) {
    await this.userService.deleteAccount(req.user.id);
    return ok(null, 'Success delete account');
  }
}
