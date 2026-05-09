import { ApiProperty } from "@nestjs/swagger";
import { IsInt } from "class-validator";

export class MealCountRequestDto {
    @ApiProperty({ example: 1, required: true})
    @IsInt()
    retreatId: number;

}