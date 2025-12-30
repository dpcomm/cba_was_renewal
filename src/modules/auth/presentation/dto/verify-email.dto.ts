import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({ description: '이메일 주소', example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: '인증 코드 (6자리)', example: '123456' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  code: string;
}
