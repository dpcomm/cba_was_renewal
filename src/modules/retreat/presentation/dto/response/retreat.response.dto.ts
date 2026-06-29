import { ApiProperty } from '@nestjs/swagger';

export class RetreatResponseDto {
  @ApiProperty({ example: 1, required: true })
  id: number;

  @ApiProperty({ example: '2026 여름 수련회', required: true })
  title: string;

  @ApiProperty({ example: '안산 수양관', required: true })
  location: string;

  @ApiProperty({ example: '경기도 안산시 단원구 수련원로 1', required: true })
  address: string;

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
    example: 10,
    required: false,
    nullable: true,
    description: '수련회 생성 시 자동 생성된 대표 신청서 ID',
  })
  surveyId: number | null;

  @ApiProperty({
    example: '2026-07-02T00:00:00.000Z',
    format: 'date-time',
    required: false,
    nullable: true,
    description: '신청서 접수 시작 일시',
  })
  surveyStartAt: string | null;

  @ApiProperty({
    example: '2026-07-05T23:59:59.000Z',
    format: 'date-time',
    required: false,
    nullable: true,
    description: '신청서 접수 종료 일시',
  })
  surveyEndAt: string | null;

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
