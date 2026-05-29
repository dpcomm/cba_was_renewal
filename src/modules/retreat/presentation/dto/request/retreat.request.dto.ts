import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateRetreatRequestDto {
  @ApiProperty({ example: '2026 여름 수련회', required: true })
  @IsString()
  title: string;

  @ApiProperty({ example: '안산 수양관', required: true })
  @IsString()
  location: string;

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
}
