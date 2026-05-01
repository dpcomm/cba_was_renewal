import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsInt, IsOptional } from "class-validator";


export class MealUpdateRequestDto{
    @ApiProperty({ example: 1 })
    @IsInt()
    id: number;
    
    @ApiProperty({ example: ['쌀밥', '미역국', '생선조림', '굴무생채', '포기김치'] })
    @IsArray()
    mealTable: string[];
}