import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class FindUserDto {
  @ApiProperty({ example: 'user123' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string;
}
