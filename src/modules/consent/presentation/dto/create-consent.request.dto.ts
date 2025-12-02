import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt } from 'class-validator';
import { ConsentType } from '../../domain/consent-type.enum';

export class CreateConsentRequestDto {
  @ApiProperty({ example: 12 })
  @IsInt()
  userId: number;

  @ApiProperty({ example: ConsentType.PrivacyPolicy, enum: ConsentType })
  @IsEnum(ConsentType)
  consentType: ConsentType;

  @ApiProperty({ example: true })
  @IsBoolean()
  value: boolean;
}
