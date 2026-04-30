import { ApiProperty } from '@nestjs/swagger';

export class AdminScanResponseDto {
  @ApiProperty({ example: 'profitia', description: '사용자 ID' })
  userId: string;

  @ApiProperty({ example: '홍길동', description: '사용자 이름' })
  name: string;

  @ApiProperty({ example: '01012345678', description: '연락처' })
  phone: string;

  @ApiProperty({ example: '총무팀', description: '중그룹' })
  group: string;

  @ApiProperty({ example: true, description: '납부 완료 여부' })
  feePaid: boolean;

  @ApiProperty({ example: true, description: '참석 여부' })
  attended: boolean;

  @ApiProperty({
    example: '2025-01-30T10:00:00.000Z',
    nullable: true,
    description: '체크인 시간 (null이면 미체크인)',
  })
  checkedInAt: Date | null;
}
