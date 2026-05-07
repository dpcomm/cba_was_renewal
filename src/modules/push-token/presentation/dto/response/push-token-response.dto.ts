import { ApiProperty } from '@nestjs/swagger';
import { PushToken } from '@modules/push-token/domain/entities/push-token.entity';

export class PushTokenResponseDto {
  @ApiProperty({ example: 121, required: true, nullable: false })
  userId: number;

  @ApiProperty({ example: 'ExponentPushToken[xxxxxx]', required: true })
  token: string;

  constructor(pushToken: PushToken) {
    this.userId = pushToken.userId;
    this.token = pushToken.token;
  }
}

export type PushTokenListResponse = PushTokenResponseDto[];
export type PushTokenSingleResponse = PushTokenResponseDto | null;
