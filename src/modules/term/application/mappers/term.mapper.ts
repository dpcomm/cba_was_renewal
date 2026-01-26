import { Injectable } from '@nestjs/common';
import { Term } from '@modules/term/domain/entities/term.entity';
import {
  TermResponseDto,
  TermListResponse,
  TermSingleResponse,
} from '@modules/term/presentation/dto/term.response.dto';

@Injectable()
export class TermMapper {
  toResponse(term: Term): TermResponseDto {
    return {
      id: term.id,
      name: term.name,
      description: term.description,
      startDate: term.startDate.toISOString(),
      endDate: term.endDate.toISOString(),
    };
  }

  toReponseList(terms: Term[]): TermListResponse {
    return terms.map((term) => this.toResponse(term));
  }

  toResponseOrNull(term: Term | null): TermSingleResponse {
    return term ? this.toResponse(term) : null;
  }
}
