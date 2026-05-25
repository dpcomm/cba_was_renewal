import { ApiProperty } from '@nestjs/swagger';

export class UserGroupOptionDto {
  @ApiProperty()
  value!: string;

  @ApiProperty()
  label!: string;
}

export class UserGroupOptionsResponseDto {
  @ApiProperty({ type: [UserGroupOptionDto] })
  groups!: UserGroupOptionDto[];
}
