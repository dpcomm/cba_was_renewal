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
    return {
      id: retreat.id,
      title: retreat.title,
      location: retreat.location,
      retreatStartAt: retreat.retreatStartAt.toISOString(),
      retreatEndAt: retreat.retreatEndAt.toISOString(),
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
