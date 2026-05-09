import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsDateString, IsOptional, IsEnum } from "class-validator";
import { MealType } from "@modules/retreat/domain/enum/retreat-meal.enum";
import { Type } from "class-transformer";

export class MealListRequestDto {
    @ApiProperty({ example: 1, required: false })
    @Type(() => Number)
    @IsOptional()
    @IsInt()
    retreatId?: number;

    @ApiProperty({
        example: '2026-08-21T00:00:00.000Z',
        format: 'date-time',
        required: false,        
    })
    @IsOptional()
    @IsDateString()
    mealDay?: string;

    @ApiProperty({ example: MealType.DINNER, required: false })
    @IsOptional()
    @IsEnum(MealType)
    mealType?: MealType;
}
