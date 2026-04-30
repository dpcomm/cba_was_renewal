import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdminGuard } from '@shared/decorators/admin-guard.decorator';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { ApiFailureResponse } from '@shared/decorators/api-failure-response.decorator';
import { ok } from '@shared/responses/api-response';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';
import {
  UserSearchListResponse,
  UserSearchResponseDto,
} from './dto/user.search.response.dto';
import { AdminUserListQueryDto } from './dto/admin-user-list-query.dto';
import {
  AdminUserResponseDto,
  AdminUserListResponseDto,
} from './dto/admin-user-response.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { GetUserQuery } from '../application/queries/get-user.query';
import { GetAdminUsersQuery } from '../application/queries/get-admin-users.query';
import { SearchUsersQuery } from '../application/queries/search-users.query';
import { AdminUpdateUserUseCase } from '../application/usecases/admin-update-user.usecase';

@ApiTags('Admin - Users')
@Controller('admin/users')
@AdminGuard()
export class UserAdminController {
  constructor(
    private readonly getAdminUsersQuery: GetAdminUsersQuery,
    private readonly getUserQuery: GetUserQuery,
    private readonly searchUsersQuery: SearchUsersQuery,
    private readonly adminUpdateUserUseCase: AdminUpdateUserUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: '[관리자] 전체 사용자 목록 조회 (검색/페이지네이션)',
  })
  @ApiSuccessResponse({ type: AdminUserListResponseDto })
  async findAll(@Query() query: AdminUserListQueryDto) {
    const { items, total } = await this.getAdminUsersQuery.execute(query);
    const payload: AdminUserListResponseDto = {
      items: items.map((user) => new AdminUserResponseDto(user)),
      total,
      page: query.page ?? 1,
      limit: query.limit ?? 10,
    };
    return ok(payload, 'Success fetch admin user list');
  }

  @Get('search')
  @ApiOperation({ summary: '[관리자] 이름으로 사용자 검색' })
  @ApiSuccessResponse({ type: UserSearchResponseDto, isArray: true })
  async searchUsers(@Query('name') name: string) {
    const users = await this.searchUsersQuery.searchByName(name ?? '');
    const payload = users.map((user) => ({
      id: user.id,
      name: user.name,
      group: user.group,
      phone: user.phone,
    }));
    return ok<UserSearchListResponse>(payload, 'Success search users');
  }

  @Get(':id')
  @ApiOperation({ summary: '[관리자] 사용자 상세 조회' })
  @ApiSuccessResponse({ type: AdminUserResponseDto })
  @ApiFailureResponse(404, ERROR_MESSAGES.USER_NOT_FOUND)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.getUserQuery.byId(id);
    return ok(
      new AdminUserResponseDto(user),
      'Success fetch admin user detail',
    );
  }

  @Patch(':id')
  @ApiOperation({
    summary: '[관리자] 사용자 정보 수정 (등급/비밀번호 초기화 포함)',
  })
  @ApiSuccessResponse({ type: AdminUserResponseDto })
  @ApiFailureResponse(404, ERROR_MESSAGES.USER_NOT_FOUND)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdminUpdateUserDto,
  ) {
    const user = await this.adminUpdateUserUseCase.execute(id, dto);
    return ok(new AdminUserResponseDto(user), 'Success update admin user');
  }
}
