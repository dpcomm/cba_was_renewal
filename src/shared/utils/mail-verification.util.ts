import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';

/**
 * 이메일 발송용 6자리 인증 코드를 생성합니다.
 */
export function generateMailVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * 이메일 인증이 완료되었음을 증명하는 임시 토큰(JWT)을 발급합니다. (5분 유효)
 */
export function generateMailVerificationToken(
  jwtService: JwtService,
  email: string,
): string {
  return jwtService.sign(
    { email, type: 'verification' },
    { expiresIn: '5m', secret: process.env.JWT_SECRET },
  );
}

/**
 * 이메일 인증 완료 증명용 verificationToken을 검증합니다.
 *
 * - 토큰이 만료되었으면 EMAIL_VERIFICATION_CODE_EXPIRED 예외
 * - payload.type !== 'verification' 이거나 payload.email !== expectedEmail 이면 EMAIL_VERIFICATION_CODE_INVALID 예외
 */
export function validateMailVerificationToken(
  jwtService: JwtService,
  token: string,
  expectedEmail: string,
): void {
  try {
    const payload = jwtService.verify(token, {
      secret: process.env.JWT_SECRET,
    });

    if (payload.type !== 'verification' || payload.email !== expectedEmail) {
      throw new BadRequestException(
        ERROR_MESSAGES.EMAIL_VERIFICATION_CODE_INVALID,
      );
    }
  } catch (e) {
    if (e instanceof BadRequestException) throw e;
    throw new BadRequestException(
      ERROR_MESSAGES.EMAIL_VERIFICATION_CODE_EXPIRED,
    );
  }
}
