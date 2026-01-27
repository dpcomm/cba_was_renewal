import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsDateString, IsInt, IsOptional } from 'class-validator';

export class noticePushRequestDto {
  @ApiPropertyOptional({
    type: [Number],
    description:
      '특정 사용자에게만 발송할 경우 userId 목록을 전달한다. 미입력 시 전체 발송.',
    example: [12, 34, 56],
  })
  @IsArray()
  @IsOptional()
  @IsInt({ each: true })
  target?: number[];

  @ApiPropertyOptional({
    example: '2026-02-01T08:30:00.000Z',
    format: 'date-time',
    description: '예약 발송 시각 (미입력 시 즉시 발송)',
  })
  @IsOptional()
  @IsDateString()
  reserveTime?: string;

  @ApiPropertyOptional({
    example: true,
    description: '본문 포함 여부 (false면 제목만 발송)',
  })
  @IsOptional()
  @IsBoolean()
  includeBody?: boolean;
}
