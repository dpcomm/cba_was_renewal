import { ApiProperty } from '@nestjs/swagger';

export class ApplicationConfigDto {
  @ApiProperty({ example: 'CBA Connect' })
  name: string;

  @ApiProperty({ example: '1.0.0' })
  versionName: string;

  @ApiProperty({ example: 1 })
  versionCode: number;

  @ApiProperty({ example: 1 })
  minimumVersionCode: number;
}

export class PrivacyPolicyConfigDto {
  @ApiProperty({
    nullable: true,
    example: 'https://sites.google.com/view/cba-connect',
  })
  url: string | null;

  @ApiProperty({ example: 1 })
  version: number;

  @ApiProperty({ nullable: true, example: '2026-01-19T00:00:00.000Z' })
  updatedAt: Date | null;
}

export class ConsentsConfigDto {
  @ApiProperty()
  privacyPolicy: PrivacyPolicyConfigDto;
}

export class MaintenanceConfigDto {
  @ApiProperty({ example: false })
  mode: boolean;

  @ApiProperty({ nullable: true, example: '서비스 점검 중입니다.' })
  message: string | null;
}

export class CurrentTermConfigDto {
  @ApiProperty({ example: 4 })
  id: number;

  @ApiProperty({ example: '2026 봄학기' })
  name: string;
}

export class CurrentRetreatConfigDto {
  @ApiProperty({ example: 4 })
  id: number;

  @ApiProperty({ example: '2026 청년부 수련회' })
  title: string;
}

export class SystemConfigResponseDto {
  @ApiProperty()
  application: ApplicationConfigDto;

  @ApiProperty()
  consents: ConsentsConfigDto;

  @ApiProperty()
  maintenance: MaintenanceConfigDto;

  @ApiProperty({ nullable: true, example: 4 })
  currentTermId: number | null;

  @ApiProperty({ nullable: true, example: 4 })
  currentRetreatId: number | null;

  @ApiProperty({ nullable: true, type: CurrentTermConfigDto })
  currentTerm: CurrentTermConfigDto | null;

  @ApiProperty({ nullable: true, type: CurrentRetreatConfigDto })
  currentRetreat: CurrentRetreatConfigDto | null;

  @ApiProperty({ example: '2026-05-29T08:00:00.000Z' })
  updatedAt: Date;
}

export class SystemConfigOptionDto {
  @ApiProperty({ example: 4 })
  id: number;

  @ApiProperty({ example: '2026 봄학기' })
  label: string;
}

export class SystemConfigOptionsResponseDto {
  @ApiProperty({ nullable: true, example: 4 })
  currentTermId: number | null;

  @ApiProperty({ nullable: true, example: 4 })
  currentRetreatId: number | null;

  @ApiProperty({ type: SystemConfigOptionDto, isArray: true })
  terms: SystemConfigOptionDto[];

  @ApiProperty({ type: SystemConfigOptionDto, isArray: true })
  retreats: SystemConfigOptionDto[];
}
