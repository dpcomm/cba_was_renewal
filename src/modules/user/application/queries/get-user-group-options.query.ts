import { Injectable } from '@nestjs/common';
import { USER_GROUP_OPTIONS } from '../../domain/enums/user-group.enum';

export interface UserGroupOption {
  value: string;
  label: string;
}

@Injectable()
export class GetUserGroupOptionsQuery {
  execute(): UserGroupOption[] {
    return [...USER_GROUP_OPTIONS];
  }
}
