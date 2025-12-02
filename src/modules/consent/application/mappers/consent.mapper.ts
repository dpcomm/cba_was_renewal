import { Injectable } from '@nestjs/common';
import { Consent } from '../../domain/entities/consent.entity';
import {
  ConsentResponseDto,
  ConsentListResponse,
  ConsentSingleResponse,
} from '../../presentation/dto/consent.response.dto';

@Injectable()
export class ConsentMapper {
  toResponse(consent: Consent): ConsentResponseDto {
    const { userId, consentType, consentedAt, value } = consent;
    return { userId, consentType, consentedAt, value };
  }

  toResponseList(consents: Consent[]): ConsentListResponse {
    return consents.map((consent) => this.toResponse(consent));
  }

  toResponseOrNull(consent: Consent | null): ConsentSingleResponse {
    return consent ? this.toResponse(consent) : null;
  }
}
