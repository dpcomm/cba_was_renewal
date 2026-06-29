import { Injectable } from '@nestjs/common';
import { Retreat } from '@modules/retreat/domain/entities/retreat.entity';
import {
  RetreatResponseDto,
  RetreatListResponse,
  RetreatSingleResponse,
} from '@modules/retreat/presentation/dto/response/retreat.response.dto';

@Injectable()
export class RetreatMapper {
  toResponse(retreat: Retreat): RetreatResponseDto {
    const representativeSurvey = retreat.surveys
      ?.slice()
      .sort((a, b) => a.id - b.id)[0];

    return {
      id: retreat.id,
      title: retreat.title,
      location: retreat.location,
      address: retreat.address,
      retreatStartAt: retreat.retreatStartAt.toISOString(),
      retreatEndAt: retreat.retreatEndAt.toISOString(),
      surveyId: representativeSurvey?.id ?? null,
      surveyStartAt: representativeSurvey?.surveyStartAt.toISOString() ?? null,
      surveyEndAt: representativeSurvey?.surveyEndAt.toISOString() ?? null,
      createdAt: retreat.createdAt.toISOString(),
      updatedAt: retreat.updatedAt.toISOString(),
    };
  }

  toResponseList(retreats: Retreat[]): RetreatListResponse {
    return retreats.map((retreat) => this.toResponse(retreat));
  }

  toResponseOrNull(retreat: Retreat | null): RetreatSingleResponse {
    return retreat ? this.toResponse(retreat) : null;
  }
}
