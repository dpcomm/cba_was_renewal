import { ApiProperty } from '@nestjs/swagger';
import { MealType } from '@modules/retreat/domain/enum/retreat-meal.enum';
import {
  TransportDirection,
  TransportType,
} from '@modules/retreat/domain/enum/retreat-transport.enum';
import { AnswerType } from '@modules/application/domain/enum/survey.enum';

/**
 * 마스터 데이터: 수련회 식단 정보
 */
export class RetreatMealResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '2025-08-14', description: '식사 날짜' })
  mealDay: string;

  @ApiProperty({
    example: ['소고기뭇국', '찰보리밥', '깍두기'],
    description: '식단표',
    nullable: true,
  })
  mealTable: string[] | null;

  @ApiProperty({ enum: MealType, example: MealType.LUNCH })
  mealType: MealType;
}

/**
 * 신청자 선택 데이터: 식단 선택
 */
export class ApplicationMealResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ type: RetreatMealResponseDto })
  retreatMeal: RetreatMealResponseDto;
}

/**
 * 마스터 데이터: 수련회 교통편 정보
 */
export class RetreatTransportResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({
    enum: TransportDirection,
    example: TransportDirection.DEPARTURE,
  })
  direction: TransportDirection;

  @ApiProperty({ enum: TransportType, example: TransportType.BUS })
  transportType: TransportType;
}

/**
 * 신청자 선택 데이터: 교통편 선택
 */
export class ApplicationTransportResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({
    example: '330로 4265',
    nullable: true,
    description: '자차 시 차량 번호',
  })
  vehicleNumber: string | null;

  @ApiProperty({ type: RetreatTransportResponseDto })
  retreatTransport: RetreatTransportResponseDto;
}

/**
 * 마스터 데이터: 설문 문항 정보
 */
export class QuestionResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '수련회 기대평을 적어주세요.' })
  title: string;

  @ApiProperty({ enum: AnswerType, example: AnswerType.SUBJECTIVE })
  answerType: AnswerType;

  @ApiProperty({ example: 1 })
  orderNo: number;

  @ApiProperty({ example: true })
  isRequired: boolean;
}

/**
 * 마스터 데이터: 설문 문항 옵션 정보
 */
export class QuestionOptionResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '좋아요' })
  content: string;
}

/**
 * 신청자 선택 데이터: 설문 응답
 */
export class AnswerResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '은혜 많이 받고 싶습니다.', nullable: true })
  content: string | null;

  @ApiProperty({ type: QuestionResponseDto })
  question: QuestionResponseDto;

  @ApiProperty({ type: QuestionOptionResponseDto, nullable: true })
  questionOption: QuestionOptionResponseDto | null;
}
