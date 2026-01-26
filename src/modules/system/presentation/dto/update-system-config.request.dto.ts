import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSystemConfigDto {
  @ApiPropertyOptional({
    description: '애플리케이션 이름',
    example: 'CBA Connect',
  })
  appName?: string;

  @ApiPropertyOptional({ description: '버전 이름', example: '1.0.0' })
  versionName?: string;

  @ApiPropertyOptional({ description: '버전 코드', example: 1 })
  versionCode?: number;

  @ApiPropertyOptional({
    description: '개인정보 처리방침 URL',
    example: 'https://sites.google.com/view/cba-connect',
  })
  privacyPolicyUrl?: string;

  @ApiPropertyOptional({ description: '개인정보 처리방침 버전', example: 1 })
  privacyPolicyVersion?: number;

  @ApiPropertyOptional({ description: '현재 학기 ID', example: 4 })
  currentTermId?: number;

  @ApiPropertyOptional({ description: '현재 수련회 ID', example: 4 })
  currentRetreatId?: number;
}
