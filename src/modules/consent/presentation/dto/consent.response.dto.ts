import { ApiProperty } from '@nestjs/swagger';
import { ConsentType } from '../../domain/consent-type.enum';

export class ConsentResponseDto {
  @ApiProperty({ example: 12 })
  userId: number;

  @ApiProperty({ example: ConsentType.PrivacyPolicy, enum: ConsentType })
  consentType: ConsentType;

  @ApiProperty({ example: '2025-02-05T12:34:56.000Z' })
  consentedAt: Date;

  @ApiProperty({ example: true })
  value: boolean;
}

export type ConsentListResponse = ConsentResponseDto[];
export type ConsentSingleResponse = ConsentResponseDto | null;
