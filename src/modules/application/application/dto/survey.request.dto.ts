import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber } from 'class-validator';

/**
 * 설문 생성
 */
export class CreateSurveyRequestDto {
  @ApiProperty({
    description: '수련회 ID',
    example: 100,
  })
  @IsNumber()
  retreatId: number;

  @ApiProperty({
    description: '설문 시작 시간',
    example: '2026-05-01T00:00:00.000Z',
  })
  @IsDateString()
  surveyStartAt: string;

  @ApiProperty({
    description: '설문 종료 시간',
    example: '2026-05-10T23:59:59.000Z',
  })
  @IsDateString()
  surveyEndAt: string;
}

/**
 * 설문 기간 수정
 */
export class UpdateSurveyPeriodRequestDto {
  @ApiProperty({
    description: '설문 ID',
    example: 1,
  })
  @IsNumber()
  surveyId: number;

  @ApiProperty({
    description: '설문 시작 시간',
    example: '2026-05-01T00:00:00.000Z',
  })
  @IsDateString()
  surveyStartAt: string;

  @ApiProperty({
    description: '설문 종료 시간',
    example: '2026-05-10T23:59:59.000Z',
  })
  @IsDateString()
  surveyEndAt: string;
}

/**
 * 수련회별 설문 조회
 */
export class GetSurveyByRetreatRequestDto {
  @ApiProperty({
    description: '수련회 ID',
    example: 100,
  })
  @IsNumber()
  retreatId: number;
}

/**
 * 설문 미리보기
 */
export class PreviewSurveyRequestDto {
  @ApiProperty({
    description: '설문 ID',
    example: 1,
  })
  @IsNumber()
  surveyId: number;
}

/**
 * 설문 삭제
 */
export class DeleteSurveyRequestDto {
  @ApiProperty({
    description: '설문 ID',
    example: 1,
  })
  @IsNumber()
  surveyId: number;
}