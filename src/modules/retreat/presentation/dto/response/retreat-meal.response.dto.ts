import { MealType } from "@modules/retreat/domain/enum/retreat-meal.enum";
import { ApiProperty } from "@nestjs/swagger";

export class RetreatMealResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 1 })
    retreatId: number;

    @ApiProperty({ example: '2026-05-01' })
    mealDay: string;

    @ApiProperty({ enum: MealType, example: MealType.DINNER })
    mealType: MealType;

    @ApiProperty({ nullable: true, example: ['쌀밥', '미역국', '생선조림', '굴무생채', '포기김치'] })
    mealTable: string[] | null;

}

export class RetreatMealListResponseDto {
    @ApiProperty({ example: 1 })
    retreatId: number;

    @ApiProperty({ type: [RetreatMealResponseDto] })
    meals: RetreatMealResponseDto[];

}