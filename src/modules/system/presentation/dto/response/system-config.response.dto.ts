import { ApiProperty } from '@nestjs/swagger';
import { SystemConfigOptions } from '../../../application/queries/get-system-config-options.query';
import { SystemConfig } from '../../../domain/entities/system-config.entity';

export class ApplicationConfigResponseDto {
  @ApiProperty({ example: 'CBA Connect' })
  name: string;

  @ApiProperty({ example: '1.0.0' })
  versionName: string;

  @ApiProperty({ example: 1 })
  versionCode: number;

  @ApiProperty({ example: 1 })
  minimumVersionCode: number;

  constructor(config: SystemConfig) {
    this.name = config.appName;
    this.versionName = config.versionName;
    this.versionCode = config.versionCode;
    this.minimumVersionCode = config.minimumVersionCode;
  }
}

export class PrivacyPolicyConfigResponseDto {
  @ApiProperty({
    nullable: true,
    example: 'https://sites.google.com/view/cba-connect',
  })
  url: string | null;

  @ApiProperty({ example: 1 })
  version: number;

  @ApiProperty({ nullable: true, example: '2026-01-19T00:00:00.000Z' })
  updatedAt: Date | null;

  constructor(config: SystemConfig) {
    this.url = config.privacyPolicyUrl;
    this.version = config.privacyPolicyVersion;
    this.updatedAt = config.privacyPolicyUpdatedAt;
  }
}

export class ConsentsConfigResponseDto {
  @ApiProperty()
  privacyPolicy: PrivacyPolicyConfigResponseDto;

  constructor(config: SystemConfig) {
    this.privacyPolicy = new PrivacyPolicyConfigResponseDto(config);
  }
}

export class MaintenanceConfigResponseDto {
  @ApiProperty({ example: false })
  mode: boolean;

  @ApiProperty({ nullable: true, example: '서비스 점검 중입니다.' })
  message: string | null;

  constructor(config: SystemConfig) {
    this.mode = config.maintenanceMode;
    this.message = config.maintenanceMessage;
  }
}

export class CurrentTermConfigResponseDto {
  @ApiProperty({ example: 4 })
  id: number;

  @ApiProperty({ example: '2026 봄학기' })
  name: string;

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }
}

export class CurrentRetreatConfigResponseDto {
  @ApiProperty({ example: 4 })
  id: number;

  @ApiProperty({ example: '2026 청년부 수련회' })
  title: string;

  @ApiProperty({ example: '양평 십자수 기도원' })
  location: string;

  @ApiProperty({ example: '경기 양평군 서종면 중미산로 938' })
  address: string;

  @ApiProperty({ example: '2026-08-21T00:00:00.000Z' })
  retreatStartAt: Date;

  @ApiProperty({ example: '2026-08-23T09:00:00.000Z' })
  retreatEndAt: Date;

  constructor(retreat: any) {
    this.id = retreat.id;
    this.title = retreat.title;
    this.location = retreat.location;
    this.address = retreat.address;
    this.retreatStartAt = retreat.retreatStartAt;
    this.retreatEndAt = retreat.retreatEndAt;
  }
}

export class SystemConfigResponseDto {
  @ApiProperty()
  application: ApplicationConfigResponseDto;

  @ApiProperty()
  consents: ConsentsConfigResponseDto;

  @ApiProperty()
  maintenance: MaintenanceConfigResponseDto;

  @ApiProperty({ nullable: true, example: 4 })
  currentTermId: number | null;

  @ApiProperty({ nullable: true, example: 4 })
  currentRetreatId: number | null;

  @ApiProperty({ nullable: true, type: CurrentTermConfigResponseDto })
  currentTerm: CurrentTermConfigResponseDto | null;

  @ApiProperty({ nullable: true, type: CurrentRetreatConfigResponseDto })
  currentRetreat: CurrentRetreatConfigResponseDto | null;

  @ApiProperty({ example: '2026-05-29T08:00:00.000Z' })
  updatedAt: Date;

  constructor(config: SystemConfig) {
    this.application = new ApplicationConfigResponseDto(config);
    this.consents = new ConsentsConfigResponseDto(config);
    this.maintenance = new MaintenanceConfigResponseDto(config);
    this.currentTermId = config.currentTermId;
    this.currentRetreatId = config.currentRetreatId;
    this.currentTerm = config.currentTerm
      ? new CurrentTermConfigResponseDto(
          config.currentTerm.id,
          config.currentTerm.name,
        )
      : null;
    this.currentRetreat = config.currentRetreat
      ? new CurrentRetreatConfigResponseDto(config.currentRetreat)
      : null;
    this.updatedAt = config.updatedAt;
  }
}

export class SystemConfigOptionResponseDto {
  @ApiProperty({ example: 4 })
  id: number;

  @ApiProperty({ example: '2026 봄학기' })
  label: string;

  constructor(id: number, label: string) {
    this.id = id;
    this.label = label;
  }
}

export class SystemConfigOptionsResponseDto {
  @ApiProperty({ nullable: true, example: 4 })
  currentTermId: number | null;

  @ApiProperty({ nullable: true, example: 4 })
  currentRetreatId: number | null;

  @ApiProperty({ type: SystemConfigOptionResponseDto, isArray: true })
  terms: SystemConfigOptionResponseDto[];

  @ApiProperty({ type: SystemConfigOptionResponseDto, isArray: true })
  retreats: SystemConfigOptionResponseDto[];

  constructor(options: SystemConfigOptions) {
    this.currentTermId = options.currentTermId;
    this.currentRetreatId = options.currentRetreatId;
    this.terms = options.terms.map(
      (term) => new SystemConfigOptionResponseDto(term.id, term.label),
    );
    this.retreats = options.retreats.map(
      (retreat) => new SystemConfigOptionResponseDto(retreat.id, retreat.label),
    );
  }
}
