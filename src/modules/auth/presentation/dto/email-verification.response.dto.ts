import { ApiProperty } from '@nestjs/swagger';

export class EmailVerificationResponseDto {
  @ApiProperty({ description: '이메일 인증 확인 토큰 (회원가입 시 제출)' })
  verificationToken: string;
}
