import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { CarpoolStatus } from '../../domain/carpool-status.enum';

export class createCarpoolRequestDto {

    @ApiProperty({example: 5, required: true})
    @IsInt()
    driverId: number;

    @ApiProperty({example: "HYUNDAI Avante - Blue", required: true})
    @IsString()
    carInfo: string;
    
    @ApiProperty({example: "2025-12-01T08:30:00.000Z", format: "date-time", required: true})
    @IsDateString()
    departureTime: string;

    @ApiProperty({example: "서울특별시 강남구 삼성역", required: true})
    @IsString()
    origin: string;

    @ApiProperty({example: "2번 출구", nullable: true})
    @IsOptional()
    @IsString()    
    originDetailed?: string | null;
    
    @ApiProperty({example: "경기도 용인시 죽전역", required: true})
    @IsString()
    destination: string;

    @ApiProperty({example: "1번 출구", nullable: true})
    @IsOptional()
    @IsString()
    destinationDetailed?: string | null;

    @ApiProperty({example: 4, required: true})
    @IsInt()
    seatsTotal: number;

    @ApiProperty({example: "탐승 전 5분 전에 도착해주세요.", required: true})
    @IsString()
    note: string;

    @ApiProperty({example: 37.5, type: Number, format: 'double', required: true})    
    @IsNumber()
    originLat: number;

    @ApiProperty({example: 127.0, type: Number, format: 'double', required: true })    
    @IsNumber()
    originLng: number;

    @ApiProperty({example: 37.3, type: Number, format: 'double', required: true })    
    @IsNumber()
    destLat: number;

    @ApiProperty({example: 127.1, type: Number, format: 'double', required: true })    
    @IsNumber()
    destLng: number;
}

export class updateCarpoolRequestDto {

    @ApiProperty({example: 2, required: true})
    @IsInt()
    carpoolId: number;

    @ApiProperty({example: 5})
    @IsOptional()
    @IsInt()
    driverId?: number;

    @ApiProperty({example: "HYUNDAI Avante - Blue"})
    @IsOptional()
    @IsString()
    carInfo?: string;
    
    @ApiProperty({example: "2025-12-01T08:30:00.000Z", format: "date-time"})
    @IsOptional()
    @IsDateString()
    departureTime?: string;

    @ApiProperty({example: "서울특별시 강남구 삼성역"})
    @IsOptional()
    @IsString()
    origin?: string;

    @ApiProperty({example: "2번 출구"})
    @IsOptional()
    @IsString()    
    originDetailed?: string | null;
    
    @ApiProperty({example: "경기도 용인시 죽전역"})
    @IsOptional()
    @IsString()
    destination?: string;

    @ApiProperty({example: "1번 출구"})
    @IsOptional()
    @IsString()
    destinationDetailed?: string | null;

    @ApiProperty({example: 4})
    @IsOptional()
    @IsInt()
    seatsTotal?: number;

    @ApiProperty({example: 7})
    @IsOptional()
    @IsInt()
    seatsLeft?: number;  

    @ApiProperty({example: false})
    @IsOptional()
    @IsBoolean()
    isArrived?: boolean;       

    @ApiProperty({example: "탐승 전 5분 전에 도착해주세요."})
    @IsOptional()
    @IsString()
    note?: string;

    @ApiProperty({example: 37.5, type: Number, format: 'double'})    
    @IsOptional()
    @IsNumber()
    originLat?: number;

    @ApiProperty({example: 127.0, type: Number, format: 'double' })    
    @IsOptional()
    @IsNumber()
    originLng?: number;

    @ApiProperty({example: 37.3, type: Number, format: 'double' })    
    @IsOptional()
    @IsNumber()
    destLat?: number;

    @ApiProperty({example: 127.1, type: Number, format: 'double' })    
    @IsOptional()
    @IsNumber()
    destLng?: number;
}
 
export class participationCarpoolRequestDto {

    @ApiProperty({example: 7, required: true})
    @IsInt()
    userId: number;

    @ApiProperty({example: 3, required: true})
    @IsInt()
    roomId: number;
}

export class updateCarpoolstatusRequestDto {
    
    @ApiProperty({example: 4, required: true})
    @IsInt()
    roomId: number;

    @ApiProperty({example: CarpoolStatus.In_Transit, enum: CarpoolStatus, required: true})
    @IsEnum(CarpoolStatus)
    newStatus: CarpoolStatus;
}

export class findAvailableCarpoolsRequestDto {

    @ApiProperty({example: 3})
    @IsOptional()
    @IsInt()
    userId?: number;
}