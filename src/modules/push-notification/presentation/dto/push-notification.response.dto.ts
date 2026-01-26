import { ApiProperty } from '@nestjs/swagger';

export class reservationPushNotificationResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  body: string;

  @ApiProperty({ type: [Number] })
  target?: number[];

  @ApiProperty({ example: '2026-02-01T08:30:00.000Z', format: 'date-time' })
  reserveTime: string;
}
