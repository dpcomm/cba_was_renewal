import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { TransportDirection, TransportType } from '../../../domain/enum/retreat-transport.enum';

export class TransportListQueryRequestDto {
  @ApiProperty({ description: '수련회 ID', example: 1 })
  @Type(() => Number)
  @IsInt()
  @IsNotEmpty()
  retreatId: number;

  @ApiProperty({ description: '방향', enum: TransportDirection, required: false })
  @IsEnum(TransportDirection)
  @IsOptional()
  direction?: TransportDirection;

  @ApiProperty({ description: '교통 수단', enum: TransportType, required: false })
  @IsEnum(TransportType)
  @IsOptional()
  transportType?: TransportType;

  @ApiProperty({ description: '검색어 (옵션명)', required: false })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({ description: '페이지 번호', default: 1, required: false })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  page: number = 1;

  @ApiProperty({ description: '페이지당 항목 수', default: 10, required: false })
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  limit: number = 10;
}
