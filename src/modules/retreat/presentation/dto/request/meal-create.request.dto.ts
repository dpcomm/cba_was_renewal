import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsDateString, IsOptional, IsEnum, IsArray } from "class-validator";
import { MealType } from "@modules/retreat/domain/enum/retreat-meal.enum";

export class MealCreateRequestDto {
    @ApiProperty({ example: 1, required: true })
    @IsInt()
    retreatId: number;

    @ApiProperty({
        example: '2026-08-21T00:00:00.000Z',
        format: 'date-time',
        required: true,        
    })
    @IsDateString()
    mealDay: string;

    @ApiProperty({ example: MealType.DINNER, required: true })
    @IsEnum(MealType)
    mealType: MealType;

    @ApiProperty({ example: ['쌀밥', '미역국', '생선조림', '굴무생채', '포기김치'] })
    @IsArray()
    mealTable: string[];    
}
