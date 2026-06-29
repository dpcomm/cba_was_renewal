import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateRetreatRequestDto {
  @ApiProperty({ example: '2026 여름 수련회', required: true })
  @IsString()
  title: string;

  @ApiProperty({ example: '안산 수양관', required: true })
  @IsString()
  location: string;

  @ApiProperty({ example: '경기도 안산시 단원구 수련원로 1', required: true })
  @IsString()
  address: string;

  @ApiProperty({
    example: '2026-08-21T00:00:00.000Z',
    format: 'date-time',
    required: true,
  })
  @IsDateString()
  retreatStartAt: string;

  @ApiProperty({
    example: '2026-08-23T00:00:00.000Z',
    format: 'date-time',
    required: true,
  })
  @IsDateString()
  retreatEndAt: string;

  @ApiProperty({
    example: '2026-07-02T00:00:00.000Z',
    format: 'date-time',
    required: true,
    description: '신청서 접수 시작 일시',
  })
  @IsDateString()
  surveyStartAt: string;

  @ApiProperty({
    example: '2026-07-05T23:59:59.000Z',
    format: 'date-time',
    required: true,
    description: '신청서 접수 종료 일시',
  })
  @IsDateString()
  surveyEndAt: string;
}

export class UpdateRetreatRequestDto {
  @ApiProperty({ example: 1, required: true })
  @IsInt()
  id: number;

  @ApiProperty({ example: '2026 여름 수련회 수정', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: '수정된 장소', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ example: '경기도 안산시 단원구 수련원로 1', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    example: '2026-08-21T00:00:00.000Z',
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  retreatStartAt?: string;

  @ApiProperty({
    example: '2026-08-23T00:00:00.000Z',
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  retreatEndAt?: string;

  @ApiProperty({
    example: '2026-07-02T00:00:00.000Z',
    format: 'date-time',
    required: false,
    description: '신청서 접수 시작 일시',
  })
  @IsOptional()
  @IsDateString()
  surveyStartAt?: string;

  @ApiProperty({
    example: '2026-07-05T23:59:59.000Z',
    format: 'date-time',
    required: false,
    description: '신청서 접수 종료 일시',
  })
  @IsOptional()
  @IsDateString()
  surveyEndAt?: string;
}
