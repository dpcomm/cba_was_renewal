import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ApplicationStatus,
  PaymentStatus,
} from '@modules/application/domain/enum/application.enum';
import { UserGroup } from '@modules/user/domain/enums/user-group.enum';

export class AdminApplicationListDto {
  @ApiProperty({ description: '수련회 ID' })
  @IsNumber()
  @Type(() => Number)
  retreatId: number;

  @ApiPropertyOptional({ description: '검색어 (이름, 아이디, 그룹)' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: '결제 상태',
    enum: PaymentStatus,
  })
  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({
    description: '신청/체크인 상태',
    enum: ApplicationStatus,
  })
  @IsEnum(ApplicationStatus)
  @IsOptional()
  applicationStatus?: ApplicationStatus;

  @ApiPropertyOptional({
    description: '그룹',
    enum: UserGroup,
  })
  @IsEnum(UserGroup)
  @IsOptional()
  group?: UserGroup;

  @ApiPropertyOptional({
    description: '페이지 번호',
    default: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: '페이지당 항목 수',
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;
}
