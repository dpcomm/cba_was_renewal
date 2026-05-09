import { MealType } from "@modules/retreat/domain/enum/retreat-meal.enum";
import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsInt } from "class-validator";

export class MealDeleteRequestDto {

    @ApiProperty({ example: 1, required: true})
    @IsInt()
    retreatId: number;

    @ApiProperty({
        example: '2026-08-21T00:00:00.000Z',
        format: 'date-time',
        required: true,
    })
    @IsDateString()
    meal_day: string;
    
    @ApiProperty({ example: MealType.DINNER, required: true })
    @IsEnum(MealType)
    meal_type: MealType;
}