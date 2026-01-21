import { ApiProperty } from '@nestjs/swagger';

export class TermResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 2026 })
    year: number;

    @ApiProperty({ example: 1 })
    termTypeId: number;

    @ApiProperty({ example: '겨울수련회' })
    termTypeName: string;

    @ApiProperty({ example: '2026-01-01' })
    startDate: string;

    @ApiProperty({ example: '2026-01-31' })
    endDate: string;
}

export type TermListResponse = TermResponseDto[];
export type TermSingleResponse = TermResponseDto | null;
