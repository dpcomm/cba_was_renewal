import { ApiProperty } from '@nestjs/swagger';

export class reservationPushNotificationResponseDto {
  @ApiProperty({ example: 101, description: '예약 ID' })
  id: number;

  @ApiProperty({ example: '정기 점검 안내', description: '푸시 제목' })
  title: string;

  @ApiProperty({
    example: '오늘 22:00~23:00 점검이 진행됩니다.',
    description: '푸시 본문',
  })
  body: string;

  @ApiProperty({
    type: [Number],
    example: [12, 34, 56],
    description:
      '특정 사용자에게만 발송할 경우 userId 목록 (미입력 시 전체)',
  })
  target?: number[];

  @ApiProperty({
    example: '2026-02-01T08:30:00.000Z',
    format: 'date-time',
    description: '예약 발송 시각',
  })
  reserveTime: string;
}
