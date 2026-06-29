import { PaymentStatus } from '@modules/application/domain/enum/application.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class UpdateAdminApplicationTransportRequestDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  retreatTransportId!: number;

  @ApiPropertyOptional({ example: null, nullable: true })
  @IsOptional()
  @IsString()
  vehicleNumber?: string | null;

  @ApiPropertyOptional({ example: null, nullable: true })
  @IsOptional()
  @IsString()
  remark?: string | null;
}

export class UpdateAdminApplicationRequestDto {
  @ApiPropertyOptional({ type: [Number], example: [1, 2, 3] })
  @ValidateIf((_object, value) => value !== undefined)
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  retreatMealIds?: number[];

  @ApiPropertyOptional({ type: [UpdateAdminApplicationTransportRequestDto] })
  @ValidateIf((_object, value) => value !== undefined)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateAdminApplicationTransportRequestDto)
  transports?: UpdateAdminApplicationTransportRequestDto[];

  @ApiPropertyOptional({ enum: PaymentStatus, example: PaymentStatus.PAID })
  @ValidateIf((_object, value) => value !== undefined)
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({ example: true })
  @ValidateIf((_object, value) => value !== undefined)
  @IsBoolean()
  checkedIn?: boolean;
}
