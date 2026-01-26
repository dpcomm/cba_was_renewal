import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class AdminApplicationListDto {
  @ApiProperty({ description: '수련회 ID' })
  @IsNumber()
  @Type(() => Number)
  retreatId: number;

  @ApiPropertyOptional({ description: '검색어 (이름, 전화번호 뒷자리)' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: '필터 (ALL, NOT_CHECKED_IN, FEE_UNPAID, EVENT_WIN)',
    example: 'ALL',
  })
  @IsString()
  @IsOptional()
  filter?: string;
}
