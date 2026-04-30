import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UserService } from '../application/user.service';
import { AdminGuard } from '@shared/decorators/admin-guard.decorator';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { ok } from '@shared/responses/api-response';
import {
  UserSearchListResponse,
  UserSearchResponseDto,
} from './dto/user.search.response.dto';

@ApiTags('Admin / Users')
@Controller('admin/users')
@AdminGuard()
export class UserAdminController {
  constructor(private readonly userService: UserService) {}

  @Get('search')
  @ApiOperation({ summary: '[관리자] 이름으로 사용자 검색' })
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
