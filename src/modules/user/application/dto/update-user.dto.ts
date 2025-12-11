import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'user123', description: 'User ID (Identity)' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 'New Name', description: 'Name', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'New Group', description: 'Group', required: false })
  @IsString()
  @IsOptional()
  group?: string;

  @ApiProperty({ example: '010-9876-5432', description: 'Phone', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: '1999-12-31', description: 'Birth', required: false })
  @IsDateString()
  @IsOptional()
  birth?: string;

  @ApiProperty({ example: 'Female', description: 'Gender', required: false })
  @IsString()
  @IsOptional()
  gender?: string;
}
