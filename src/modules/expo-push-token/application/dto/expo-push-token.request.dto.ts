import { ApiProperty } from "@nestjs/swagger";
import { IsInt, isString, IsString } from "class-validator";

export class registExpoPushTokenRequestDto {
    @ApiProperty({example: 12, required: true})
    @IsInt()
    userId: number;

    @ApiProperty({example: 'expo-push-token', required: true})
    @IsString()
    token: string;
}

export class deleteExpoPushTokenRequestDto {
    @ApiProperty({example: 'expo token'})
    @IsString()
    token: string;
}