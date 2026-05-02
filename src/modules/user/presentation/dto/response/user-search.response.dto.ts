import { ApiProperty } from '@nestjs/swagger';

export class UserSearchResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  group: string;

  @ApiProperty()
  phone: string;

  constructor(user: any) {
    this.id = user.id;
    this.name = user.name;
    this.group = user.group;
    this.phone = user.phone;
  }
}

export type UserSearchListResponse = UserSearchResponseDto[];
