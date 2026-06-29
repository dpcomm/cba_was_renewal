import { ApiProperty } from '@nestjs/swagger';
import { UserGroup } from '@modules/user/domain/enums/user-group.enum';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class UpsertMyApplicationTransportRequestDto {
  @ApiProperty({ example: 10 })
  @IsInt()
  retreatTransportId: number;

  @ApiProperty({ example: '12가3456', required: false, nullable: true })
  @IsOptional()
  @IsString()
  vehicleNumber?: string | null;

  @ApiProperty({ example: '대전역 하차', required: false, nullable: true })
  @IsOptional()
  @IsString()
  remark?: string | null;
}

export class UpsertMyApplicationAnswerRequestDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  questionId: number;

  @ApiProperty({ example: 3, required: false, nullable: true })
  @IsOptional()
  @IsInt()
  questionOptionId?: number | null;

  @ApiProperty({
    example: '기도 제목입니다.',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  content?: string | null;
}

export class UpsertMyApplicationRequestDto {
  @ApiProperty({
    enum: UserGroup,
    example: UserGroup.KWON_SOON_YOUNG_AND_LIM_KANG_MI_M,
  })
  @IsEnum(UserGroup)
  group: UserGroup;

  @ApiProperty({ example: 10 })
  @IsInt()
  surveyId: number;

  @ApiProperty({ type: [Number], example: [1, 2, 3], required: false })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  retreatMealIds?: number[];

  @ApiProperty({
    type: [UpsertMyApplicationTransportRequestDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertMyApplicationTransportRequestDto)
  transports?: UpsertMyApplicationTransportRequestDto[];

  @ApiProperty({ type: [UpsertMyApplicationAnswerRequestDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertMyApplicationAnswerRequestDto)
  answers?: UpsertMyApplicationAnswerRequestDto[];
}
