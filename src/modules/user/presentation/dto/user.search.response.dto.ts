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
}

export type UserSearchListResponse = UserSearchResponseDto[];
