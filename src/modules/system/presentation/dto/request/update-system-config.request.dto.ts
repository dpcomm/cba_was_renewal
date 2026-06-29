import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateSystemConfigRequestDto {
  @ApiPropertyOptional({
    description: '애플리케이션 이름',
    example: 'CBA Connect',
  })
  @IsString()
  @IsOptional()
  appName?: string;

  @ApiPropertyOptional({ description: '버전 이름', example: '1.0.0' })
  @IsString()
  @IsOptional()
  versionName?: string;

  @ApiPropertyOptional({ description: '버전 코드', example: 1 })
  @IsInt()
  @IsOptional()
  versionCode?: number;

  @ApiPropertyOptional({ description: '최소 지원 버전 코드', example: 1 })
  @IsInt()
  @IsOptional()
  minimumVersionCode?: number;

  @ApiPropertyOptional({
    description: '개인정보 처리방침 URL',
    example: 'https://sites.google.com/view/cba-connect',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  privacyPolicyUrl?: string | null;

  @ApiPropertyOptional({ description: '개인정보 처리방침 버전', example: 1 })
  @IsInt()
  @IsOptional()
  privacyPolicyVersion?: number;

  @ApiPropertyOptional({
    description: '개인정보 처리방침 개정일',
    example: '2026-01-19T00:00:00.000Z',
    nullable: true,
  })
  @IsDateString()
  @IsOptional()
  privacyPolicyUpdatedAt?: string | null;

  @ApiPropertyOptional({ description: '점검 모드 여부', example: false })
  @IsBoolean()
  @IsOptional()
  maintenanceMode?: boolean;

  @ApiPropertyOptional({
    description: '점검 메시지',
    example: '서비스 점검 중입니다.',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  maintenanceMessage?: string | null;

  @ApiPropertyOptional({
    description: '현재 선택식 강의 시즌 ID',
    example: 4,
    nullable: true,
  })
  @IsInt()
  @IsOptional()
  currentTermId?: number | null;

  @ApiPropertyOptional({
    description: '현재 수련회 ID',
    example: 4,
    nullable: true,
  })
  @IsInt()
  @IsOptional()
  currentRetreatId?: number | null;
}
