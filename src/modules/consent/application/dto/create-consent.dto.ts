import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum } from 'class-validator';
import { ConsentType } from '../../domain/consent-type.enum';

export class CreateConsentDto {
  @ApiProperty({ example: ConsentType.PrivacyPolicy, enum: ConsentType })
  @IsEnum(ConsentType)
  consentType: ConsentType;

  @ApiProperty({ example: true })
  @IsBoolean()
  value: boolean;
}
