import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsArray,
} from 'class-validator';

export class createPushNotificationRequestDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  body: string;

  @ApiProperty({ type: [Number] })
  @IsArray()
  @IsOptional()
  @IsInt({ each: true })
  target?: number[];
}

export class reservePushNotificationRequestDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  body: string;

  @ApiProperty({ type: [Number] })
  @IsArray()
  @IsOptional()
  @IsInt({ each: true })
  target?: number[];

  @ApiProperty({ example: '2026-02-01T08:30:00.000Z', format: 'date-time' })
  @IsDateString()
  reserveTime: string;
}
