import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class checkApplicationRequestDto {
  @ApiProperty({ example: 'userId', required: true })
  @IsString()
  userId: string;

  @ApiProperty({ example: 1, required: true })
  @IsInt()
  retreatId: number;
}
