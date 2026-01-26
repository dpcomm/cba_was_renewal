import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateSystemConfigDto {
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
  @IsNumber()
  @IsOptional()
  versionCode?: number;

  @ApiPropertyOptional({
    description: '개인정보 처리방침 URL',
    example: 'https://sites.google.com/view/cba-connect',
  })
  @IsString()
  @IsOptional()
  privacyPolicyUrl?: string;

  @ApiPropertyOptional({ description: '개인정보 처리방침 버전', example: 1 })
  @IsNumber()
  @IsOptional()
  privacyPolicyVersion?: number;

  @ApiPropertyOptional({ description: '현재 학기 ID', example: 4 })
  @IsNumber()
  @IsOptional()
  currentTermId?: number;

  @ApiPropertyOptional({ description: '현재 수련회 ID', example: 4 })
  @IsNumber()
  @IsOptional()
  currentRetreatId?: number;
}
