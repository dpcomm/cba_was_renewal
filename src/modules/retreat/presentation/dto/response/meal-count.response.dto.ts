import { MealType } from "@modules/retreat/domain/enum/retreat-meal.enum";
import { ApiProperty } from "@nestjs/swagger";

export class MealCountResponseDto {
    @ApiProperty({ example: '2026-05-01' })
    mealDay: string;

    @ApiProperty({ enum: MealType, example: MealType.DINNER })
    mealType: MealType;

    @ApiProperty({ example: 100 })
    count: number;
}

export class RetreatMealCountListResponseDto {
    @ApiProperty({ example: 1 })
    retreatId: number;

    @ApiProperty({ type: [MealCountResponseDto] })
    counts: MealCountResponseDto[];
}