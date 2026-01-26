import { ApiProperty } from '@nestjs/swagger';

export class ApplicationConfigDto {
  @ApiProperty({ example: 'CBA Connect' })
  name: string;

  @ApiProperty({ example: '1.0.0' })
  versionName: string;

  @ApiProperty({ example: 1 })
  versionCode: number;
}

export class PrivacyPolicyConfigDto {
  @ApiProperty({ example: 'https://sites.google.com/view/cba-connect' })
  url: string;

  @ApiProperty({ example: 1 })
  version: number;
}

export class ConsentsConfigDto {
  @ApiProperty()
  privacyPolicy: PrivacyPolicyConfigDto;
}

export class SystemConfigResponseDto {
  @ApiProperty()
  application: ApplicationConfigDto;

  @ApiProperty()
  consents: ConsentsConfigDto;

  @ApiProperty({ nullable: true, example: 4 })
  currentTermId: number | null;

  @ApiProperty({ nullable: true, example: 4 })
  currentRetreatId: number | null;
}
