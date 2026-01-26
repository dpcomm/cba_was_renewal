import { ApiProperty } from '@nestjs/swagger';

export class TermResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '2026 겨울 수련회' })
  name: string;

  @ApiProperty({ example: '2026년도 겨울 수련회 설명' })
  description: string;

  @ApiProperty({ example: '2026-01-01' })
  startDate: string;

  @ApiProperty({ example: '2026-01-31' })
  endDate: string;
}

export type TermListResponse = TermResponseDto[];
export type TermSingleResponse = TermResponseDto | null;
