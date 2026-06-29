import { AnswerType } from '@modules/application/domain/enum/survey.enum';
import { MealType } from '@modules/retreat/domain/enum/retreat-meal.enum';
import {
  TransportDirection,
  TransportType,
} from '@modules/retreat/domain/enum/retreat-transport.enum';
import { UserGroup } from '@modules/user/domain/enums/user-group.enum';
import { ApiProperty } from '@nestjs/swagger';

export class ApplicationFormRetreatDto {
  @ApiProperty({ example: 4 })
  id?: number;

  @ApiProperty({ example: '2026 여름 수련회' })
  title?: string;

  @ApiProperty({ example: '수련원' })
  location?: string;

  @ApiProperty({ example: '2026-08-21T00:00:00.000Z' })
  retreatStartAt?: Date;

  @ApiProperty({ example: '2026-08-23T00:00:00.000Z' })
  retreatEndAt?: Date;
}

export class ApplicationFormQuestionOptionDto {
  @ApiProperty({ example: 1 })
  id?: number;

  @ApiProperty({ example: '참석' })
  label?: string;

  @ApiProperty({ example: 1 })
  orderNo?: number;
}

export class ApplicationFormQuestionDto {
  @ApiProperty({ example: 1 })
  id?: number;

  @ApiProperty({ example: '수련회 기대평을 적어주세요.' })
  title?: string;

  @ApiProperty({ enum: AnswerType, example: AnswerType.SUBJECTIVE })
  answerType?: AnswerType;

  @ApiProperty({ example: true })
  isRequired?: boolean;

  @ApiProperty({ example: 1 })
  orderNo?: number;

  @ApiProperty({ type: [ApplicationFormQuestionOptionDto] })
  options?: ApplicationFormQuestionOptionDto[];
}

export class ApplicationFormSurveyDto {
  @ApiProperty({ example: 10 })
  id?: number;

  @ApiProperty({ example: '2026 여름 수련회 신청서' })
  title?: string;

  @ApiProperty({ example: '2026-07-02T00:00:00.000Z' })
  surveyStartAt?: Date;

  @ApiProperty({ example: '2026-07-05T23:59:59.000Z' })
  surveyEndAt?: Date;

  @ApiProperty({ type: [ApplicationFormQuestionDto] })
  questions?: ApplicationFormQuestionDto[];
}

export class ApplicationFormGroupDto {
  @ApiProperty({ enum: UserGroup })
  value?: UserGroup;

  @ApiProperty({ example: '권수영&임강미M' })
  label?: string;
}

export class ApplicationFormMealDto {
  @ApiProperty({ example: 1 })
  id?: number;

  @ApiProperty({ example: '2026-08-21' })
  mealDay?: string;

  @ApiProperty({ enum: MealType, example: MealType.DINNER })
  mealType?: MealType;
}

export class ApplicationFormTransportDto {
  @ApiProperty({ example: 1 })
  id?: number;

  @ApiProperty({ enum: TransportDirection })
  direction?: TransportDirection;

  @ApiProperty({ enum: TransportType })
  transportType?: TransportType;

  @ApiProperty({ example: '대전역 출발 버스' })
  name?: string;

  @ApiProperty({ example: false })
  isVehicleRequired?: boolean;

  @ApiProperty({ example: false })
  isRemarkRequired?: boolean;
}

export class ApplicationFormTransportsDto {
  @ApiProperty({ type: [ApplicationFormTransportDto] })
  departure?: ApplicationFormTransportDto[];

  @ApiProperty({ type: [ApplicationFormTransportDto] })
  return?: ApplicationFormTransportDto[];
}

export class MyApplicationFormTransportDto {
  @ApiProperty({ example: 1 })
  retreatTransportId?: number;

  @ApiProperty({ nullable: true, example: '12가3456' })
  vehicleNumber?: string | null;

  @ApiProperty({ nullable: true, example: '대전역 하차' })
  remark?: string | null;
}

export class MyApplicationFormAnswerDto {
  @ApiProperty({ example: 1 })
  questionId?: number;

  @ApiProperty({ nullable: true, example: 3 })
  questionOptionId?: number | null;

  @ApiProperty({ nullable: true, example: '기도 제목입니다.' })
  content?: string | null;
}

export class MyApplicationFormDto {
  @ApiProperty({ example: 1 })
  id?: number;

  @ApiProperty({ type: [Number], example: [1, 2, 3] })
  retreatMealIds?: number[];

  @ApiProperty({ type: [MyApplicationFormTransportDto] })
  transports?: MyApplicationFormTransportDto[];

  @ApiProperty({ type: [MyApplicationFormAnswerDto] })
  answers?: MyApplicationFormAnswerDto[];
}
