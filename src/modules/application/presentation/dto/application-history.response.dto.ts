import { ApiProperty } from '@nestjs/swagger';

export class ApplicationHistoryResponseDto {
  @ApiProperty({
    description: '신청한 수련회 ID 목록',
    example: [1, 2, 3],
    type: [Number],
  })
  retreatIds: number[];
}
