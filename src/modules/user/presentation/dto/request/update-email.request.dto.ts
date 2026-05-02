import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class UpdateEmailDto {
  @ApiProperty({
    example: 'user@example.com',
    description: '등록/변경할 이메일',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'eyJhbGciOiJI...',
    description: '이메일 인증 후 받은 verificationToken',
  })
  @IsString()
  verificationToken: string;
}
