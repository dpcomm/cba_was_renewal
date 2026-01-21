import { ApiProperty } from '@nestjs/swagger';

export class TermTypeResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: '겨울수련회' })
    name: string;
}

export type TermTypeListResponse = TermTypeResponseDto[];
export type TermTypeSingleResponse = TermTypeResponseDto | null;
