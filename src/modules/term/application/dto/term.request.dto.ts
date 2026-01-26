import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class createTermRequestDto {
  @ApiProperty({ example: '2026 겨울 수련회' })
  @IsString()
  name: string;

  @ApiProperty({ example: '2026년도 겨울 수련회 설명' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2026-01-01', format: 'date' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-01-31', format: 'date' })
  @IsDateString()
  endDate: string;
}

export class updateTermRequestDto {
  @ApiProperty({ example: 1, required: true })
  @IsInt()
  termId: number;

  @ApiProperty({ example: '2026 겨울 수련회' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: '2026년도 겨울 수련회 설명' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2026-01-01', format: 'date', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ example: '2026-01-31', format: 'date', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
