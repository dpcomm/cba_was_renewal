import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { ok } from '@shared/responses/api-response';
import { GetUserGroupOptionsQuery } from '../application/queries/get-user-group-options.query';
import { UserGroupOptionsResponseDto } from './dto/response/user-group-options.response.dto';

@ApiTags('Users')
@Controller('users/options')
export class UserOptionsController {
  constructor(
    private readonly getUserGroupOptionsQuery: GetUserGroupOptionsQuery,
  ) {}

  @Get('groups')
  @ApiOperation({ summary: '회원 그룹 옵션 조회' })
  @ApiSuccessResponse({ type: UserGroupOptionsResponseDto })
  async getGroups() {
    const groups = await this.getUserGroupOptionsQuery.execute();
    return ok<UserGroupOptionsResponseDto>(
      { groups },
      'Success get user group options',
    );
  }
}
