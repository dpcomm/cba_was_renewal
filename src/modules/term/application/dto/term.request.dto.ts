import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class createTermRequestDto {
    @ApiProperty({ example: 2026 })
    @IsInt()
    year: number;

    @ApiProperty({ example: 1, description: 'termType id' })
    @IsInt()
    termTypeId: number;

    @ApiProperty({ example: '2026-01-01', format: 'date' })
    @IsDateString()
    startDate: string;

    @ApiProperty({ example: '2026-01-31', format: 'date' })
    @IsDateString()
    endDate: string;
}

export class getTermFilterDto {
    @ApiProperty({ example: 2026, required: false })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    year?: number;

    @ApiProperty({ example: 1, required: false })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    termTypeId?: number;
}

export class updateTermRequestDto {
    @ApiProperty({ example: 1, required: true})
    @IsInt()
    termId: number;

    @ApiProperty({ example: '2026-01-01', format: 'date', required: false })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiProperty({ example: '2026-01-31', format: 'date', required: false })
    @IsOptional()
    @IsDateString()
    endDate?: string;
}