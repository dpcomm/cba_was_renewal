import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'user@example.com',
    description: '인증된 이메일 주소',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1...',
    description: '이메일 인증 후 발급받은 토큰',
  })
  @IsString()
  @IsNotEmpty()
  verificationToken: string;

  @ApiProperty({
    example: 'newPassword123!',
    description: '새 비밀번호',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}
