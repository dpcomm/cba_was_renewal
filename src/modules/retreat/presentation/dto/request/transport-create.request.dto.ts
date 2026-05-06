import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';
import { TransportDirection, TransportType } from '../../../domain/enum/retreat-transport.enum';

export class TransportCreateRequestDto {
  @ApiProperty({ description: '수련회 ID', example: 1 })
  @IsInt()
  @IsNotEmpty()
  retreatId: number;

  @ApiProperty({ description: '방향', enum: TransportDirection, example: TransportDirection.DEPARTURE })
  @IsEnum(TransportDirection)
  @IsNotEmpty()
  direction: TransportDirection;

  @ApiProperty({ description: '수단', enum: TransportType, example: TransportType.BUS })
  @IsEnum(TransportType)
  @IsNotEmpty()
  transportType: TransportType;

  @ApiProperty({ description: '이름', example: '본대 대형버스' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: '차량번호 필수 여부', example: false, default: false })
  @IsBoolean()
  @IsOptional()
  isVehicleRequired: boolean = false;

  @ApiProperty({ description: '비고 필수 여부', example: false, default: false })
  @IsBoolean()
  @IsOptional()
  isRemarkRequired: boolean = false;
}
