import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user123', description: 'User ID' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'password123', description: 'User Password' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: true, description: '자동 로그인 여부', required: false })
  @IsBoolean()
  @IsOptional()
  autoLogin?: boolean;
}
