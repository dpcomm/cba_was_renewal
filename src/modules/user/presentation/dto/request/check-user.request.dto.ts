import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { UserGroup } from '@modules/user/domain/enums/user-group.enum';

export class CheckUserDto {
  @ApiProperty({ example: 'user123' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 'password123', required: false })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({ example: 'Name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Male' })
  @IsString()
  gender: string;

  @ApiProperty({ example: '010-1234-5678' })
  @IsString()
  phone: string;

  @ApiProperty({ enum: UserGroup, example: UserGroup.BRIDGE })
  @IsEnum(UserGroup)
  group: UserGroup;

  @ApiProperty({ example: '2000-01-01' })
  @IsString()
  birth: string;
}
