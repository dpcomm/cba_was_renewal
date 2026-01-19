import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsInt, IsString } from "class-validator";
import { Platform } from "@modules/fcm/domain/platform.enum";

export class registFcmTokenRequestDto {

    @ApiProperty({example: 13, required: true})
    @IsInt()
    userId: number;

    @ApiProperty({example: 'token', required: true})
    @IsString()
    token: string;

    @ApiProperty({example: Platform.Android, required: true})
    @IsEnum(Platform)
    platform: Platform;

}

export class unregistFcmTokenRequestDto {
    @ApiProperty({example: 'token', required: true})
    @IsString()
    token: string;    
}

// token만 사용할 수도 있음.
export class deleteFcmTokenRequestDto {

    // @ApiProperty({example: 13, required: true})
    // @IsInt()
    // userId: number;

    @ApiProperty({example: 'token', required: true})
    @IsString()
    token: string;

    // @ApiProperty({example: Platform.Android, required: true})
    // @IsEnum(Platform)
    // platform: Platform;

}

export class refreshFcmTokenRequestDto {

    @ApiProperty({example: 13, required: true})
    @IsInt()
    userId: number;

    @ApiProperty({example: 'oldtoken', required: true})
    @IsString()
    oldToken: string;

    @ApiProperty({example: 'newtoken', required: true})
    @IsString()
    newToken: string;

    @ApiProperty({example: Platform.Android, required: true})
    @IsEnum(Platform)
    platform: Platform;

}