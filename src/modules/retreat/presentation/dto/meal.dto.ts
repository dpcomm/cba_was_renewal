import { ApiProperty } from '@nestjs/swagger';
import { MealType } from "@modules/retreat/domain/enum/retreat-meal.enum";

export class MealDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  retreatId: number;

  @ApiProperty({
    example: '2026-08-21',
    description: '식사 날짜 (YYYY-MM-DD)',
  })
  mealDay: string;

  @ApiProperty({
    enum: MealType,
    example: MealType.BREAKFAST,
  })
  mealType: MealType;

  @ApiProperty({
    example: ['쌀밥', '미역국', '생선조림', '굴무생채', '포기김치'],
    type: [String],
  })
  mealTable: string[];

}