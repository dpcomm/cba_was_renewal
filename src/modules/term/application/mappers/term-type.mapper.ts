import { Injectable } from "@nestjs/common";
import { TermType } from "@modules/term/domain/entities/term-type.entity";
import { 
    TermTypeListResponse, 
    TermTypeResponseDto, 
    TermTypeSingleResponse, 
} from "@modules/term/presentation/dto/term-type.response.dto";

@Injectable()
export class TermTypeMapper {
    toResponse(termType: TermType): TermTypeResponseDto {
        return {
            id: termType.id,
            name: termType.name
        };
    }

    toResponseList(termTypes: TermType[]): TermTypeListResponse {
        return termTypes.map((term) => this.toResponse(term));
    }

    toResponseOrNull(termType: TermType | null): TermTypeSingleResponse {
        return termType? this.toResponse(termType) : null;
    }
}