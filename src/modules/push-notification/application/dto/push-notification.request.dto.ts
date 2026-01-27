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
  @ApiProperty({
    example: '긴급 안내',
    description: '푸시 제목',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: '서버 점검이 10분 후 시작됩니다.',
    description: '푸시 본문',
  })
  @IsString()
  body: string;

  @ApiProperty({
    type: [Number],
    description:
      '특정 사용자에게만 발송할 경우 userId 목록을 전달한다. 미입력 시 전체 발송.',
    example: [12, 34, 56],
  })
  @IsArray()
  @IsOptional()
  @IsInt({ each: true })
  target?: number[];
}

export class reservePushNotificationRequestDto {
  @ApiProperty({
    example: '정기 점검 안내',
    description: '푸시 제목',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: '오늘 22:00~23:00 점검이 진행됩니다.',
    description: '푸시 본문',
  })
  @IsString()
  body: string;

  @ApiProperty({
    type: [Number],
    description:
      '특정 사용자에게만 발송할 경우 userId 목록을 전달한다. 미입력 시 전체 발송.',
    example: [12, 34, 56],
  })
  @IsArray()
  @IsOptional()
  @IsInt({ each: true })
  target?: number[];

  @ApiProperty({
    example: '2026-02-01T08:30:00.000Z',
    format: 'date-time',
    description: '예약 발송 시각',
  })
  @IsDateString()
  reserveTime: string;
}
