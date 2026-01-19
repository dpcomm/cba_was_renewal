import { Optional } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsInt, IsString, IsNumber, IsOptional, IsDateString, IsArray } from 'class-validator';

export class createPushNotificationRequestDto {
    @ApiProperty()
    @IsString()
    title: string;

    @ApiProperty()
    @IsString()
    body: string;

    @ApiProperty({type: [Number] })
    @IsArray()
    @IsOptional()
    @IsInt({ each: true })
    target?: number[];
}