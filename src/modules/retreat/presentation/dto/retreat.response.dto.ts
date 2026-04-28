import { ApiProperty } from '@nestjs/swagger';

export class RetreatResponseDto {
  @ApiProperty({ example: 1, required: true })
  id: number;

  @ApiProperty({ example: '2026 여름 수련회', required: true })
  title: string;

  @ApiProperty({ example: '안산 수양관', required: true })
  location: string;

  @ApiProperty({
    example: '2026-08-21T00:00:00.000Z',
    format: 'date-time',
    required: true,
  })
  retreatStartAt: string;

  @ApiProperty({
    example: '2026-08-21T00:00:00.000Z',
    format: 'date-time',
    required: true,
  })
  retreatEndAt: string;

  @ApiProperty({
    example: '2026-08-23T00:00:00.000Z',
    format: 'date-time',
    required: true,
  })
  createdAt: string;

  @ApiProperty({
    example: '2026-08-23T00:00:00.000Z',
    format: 'date-time',
    required: true,
  })
  updatedAt: string;
}

export type RetreatListResponse = RetreatResponseDto[];
export type RetreatSingleResponse = RetreatResponseDto | null;
