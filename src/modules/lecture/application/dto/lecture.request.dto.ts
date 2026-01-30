import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class createLectureRequestDto {
  @ApiProperty({ example: 'test lecture title', required: true })
  @IsString()
  title: string;

  @ApiProperty({ example: 'test lecture introduction', required: true })
  @IsString()
  introduction: string;

  @ApiProperty({ example: 'test lecture instructor', required: true })
  @IsString()
  instructor: string;

  @ApiProperty({ example: 'test lecture instructor bio', required: false })
  @IsOptional()
  @IsString()
  instructorBio?: string;

  @ApiProperty({ example: 'test lecture location', required: true })
  @IsString()
  location: string;

  @ApiProperty({ example: 30, required: true })
  @IsInt()
  maxCapacity: number;

  @ApiProperty({
    example: '2025-12-01T08:30:00.000Z',
    format: 'date-time',
    required: true,
  })
  @IsDateString()
  startTime: string;

  @ApiProperty({
    example: 1,
    description: '강의가 속한 학기(Term) ID',
    required: true,
  })
  @IsInt()
  termId: number;
}
export class updateLectureRequestDto {
  @ApiProperty({ example: 1, required: true })
  @IsInt()
  id: number;

  @ApiProperty({ example: 'test lecture title', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'test lecture introduction', required: false })
  @IsOptional()
  @IsString()
  introduction?: string;

  @ApiProperty({ example: 'test lecture instructor', required: false })
  @IsOptional()
  @IsString()
  instructor?: string;

  @ApiProperty({ example: 'test lecture instructor bio', required: false })
  @IsOptional()
  @IsString()
  instructorBio?: string;

  @ApiProperty({ example: 'test lecture location', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ example: 30, required: false })
  @IsOptional()
  @IsInt()
  maxCapacity?: number;

  @ApiProperty({
    example: '2025-12-01T08:30:00.000Z',
    format: 'date-time',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startTime?: string;
}

export class enrollLectureRequestDto {
  @ApiProperty({ example: 1, required: true })
  @IsInt()
  userId: number;

  @ApiProperty({ example: 1, required: true })
  @IsInt()
  lectureId: number;
}

export class dropLectureRequestDto {
  @ApiProperty({ example: 1, required: true })
  @IsInt()
  userId: number;

  @ApiProperty({ example: 1, required: true })
  @IsInt()
  lectureId: number;
}

export class autoAssignLectureRequestDto {
  @ApiProperty({
    example: 1,
    description: '강의가 속한 학기(Term) ID',
    required: true,
  })
  @IsInt()
  termId: number;
}

export class enrollEligibleLectureRequestDto {
  @ApiProperty({ example: 1, required: true })
  @IsInt()
  lectureId: number;

  @ApiProperty({ example: [1, 2, 3], required: true })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  userIds: number[];
}
