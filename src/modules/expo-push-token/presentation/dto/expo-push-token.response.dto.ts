import { ApiProperty } from "@nestjs/swagger";

export class ExpoPushTokenResponseDto {
    @ApiProperty({example: 121, required: true, nullable: false})
    userId: number;

    @ApiProperty({example: 'expo-push-token', required: true})
    token: string;

}

export type ExpoPushTokenListResponse = ExpoPushTokenResponseDto[];
export type ExpoPushTokenSingleResponse = ExpoPushTokenResponseDto | null;