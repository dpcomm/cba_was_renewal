import { ApiProperty } from '@nestjs/swagger';
import { Platform } from '@modules/fcm/domain/platform.enum';
import { FcmToken } from '@modules/fcm/domain/entities/fcm-token.entity';

export class FcmTokenResponseDto {
  @ApiProperty({ example: 121, required: true, nullable: true })
  userId: number | null;

  @ApiProperty({ example: 'tokentokentokentoken', required: true })
  token: string;

  @ApiProperty({ example: Platform.Android, required: true })
  platform: Platform;
}

// 1. refresh시 해당 interface를 사용할지.
// 2. 새로운 newToken만 FcmTokenResponseDto로 변경할지.
// 3. array로 refresh response type을 생성할지.
export interface FcmTokenRefreshResponse {
  oldToken: FcmTokenResponseDto;
  newToken: FcmTokenResponseDto;
}
export type FcmTokenSingleResponse = FcmTokenResponseDto | null;
