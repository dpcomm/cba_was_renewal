import { ApiProperty } from '@nestjs/swagger';
import {
  ApplicationStatus,
  // EventResult,
  PaymentStatus,
} from '@modules/application/domain/enum/application.enum';
// import { AnswerType } from '@modules/application/domain/enum/survey.enum';
import { MealType } from '@modules/retreat/domain/enum/retreat-meal.enum';
import {
  TransportDirection,
  TransportType,
} from '@modules/retreat/domain/enum/retreat-transport.enum';
import { UserGroup } from '@modules/user/domain/enums/user-group.enum';

export class AdminApplicationDetailUserDto {
  @ApiProperty({ example: 'profitia' })
  userId!: string;

  @ApiProperty({ example: '김호준' })
  name!: string;

  @ApiProperty({ enum: UserGroup, example: UserGroup.ETC })
  group!: UserGroup;

  @ApiProperty({ example: 'male', nullable: true })
  gender!: string | null;

  @ApiProperty({ example: '1900-01-01T00:00:00.000Z', nullable: true })
  birth!: Date | null;

  @ApiProperty({ example: '010-6433-4083' })
  phone!: string;
}

export class AdminApplicationDetailStatusDto {
  @ApiProperty({
    enum: ApplicationStatus,
    example: ApplicationStatus.CHECKED_IN,
  })
  applicationStatus!: ApplicationStatus;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.PAID })
  paymentStatus!: PaymentStatus;

  @ApiProperty({ example: '2026-01-29T16:44:37.726Z', nullable: true })
  checkedInAt!: Date | null;
}

export class AdminApplicationDetailSurveyDto {
  @ApiProperty({ example: 7 })
  id!: number;

  @ApiProperty({ example: '2026 겨울 수련회 신청서' })
  title!: string;
}

export class AdminApplicationDetailInfoDto {
  @ApiProperty({ example: '2025-11-29T06:14:34.563Z' })
  appliedAt!: Date;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.PAID })
  paymentStatus!: PaymentStatus;

  @ApiProperty({ example: '2026-01-29T16:44:37.726Z', nullable: true })
  checkedInAt!: Date | null;

  // @ApiProperty({ enum: EventResult, example: EventResult.LOSE, nullable: true })
  // eventResult!: EventResult | null;

  // @ApiProperty({ example: '2026-01-29T16:44:41.566Z', nullable: true })
  // eventParticipatedAt!: Date | null;

  @ApiProperty({ type: AdminApplicationDetailSurveyDto })
  survey!: AdminApplicationDetailSurveyDto;
}

// export class AdminApplicationAnswerDto {
//   @ApiProperty({ example: 1 })
//   answerId!: number;

//   @ApiProperty({ example: 1 })
//   questionId!: number;

//   @ApiProperty({ example: '수련회 기대평을 적어주세요.' })
//   questionTitle!: string;

//   @ApiProperty({ enum: AnswerType, example: AnswerType.SUBJECTIVE })
//   answerType!: AnswerType;

//   @ApiProperty({ example: 1 })
//   questionOrderNo!: number;

//   @ApiProperty({ example: null, nullable: true })
//   optionId!: number | null;

//   @ApiProperty({ example: null, nullable: true })
//   optionLabel!: string | null;

//   @ApiProperty({ example: '은혜 많이 받고 싶습니다.', nullable: true })
//   content!: string | null;
// }

export class AdminApplicationMealDto {
  @ApiProperty({ example: 1 })
  applicationMealId!: number;

  @ApiProperty({ example: 1 })
  retreatMealId!: number;

  @ApiProperty({ example: '2026-01-29' })
  mealDay!: string;

  @ApiProperty({ enum: MealType, example: MealType.DINNER })
  mealType!: MealType;
}

export class AdminApplicationTransportDto {
  @ApiProperty({ example: 1 })
  applicationTransportId!: number;

  @ApiProperty({ example: 1 })
  retreatTransportId!: number;

  @ApiProperty({
    enum: TransportDirection,
    example: TransportDirection.DEPARTURE,
  })
  direction!: TransportDirection;

  @ApiProperty({ enum: TransportType, example: TransportType.BUS })
  transportType!: TransportType;

  @ApiProperty({ example: '교회 출발 버스' })
  name!: string;

  @ApiProperty({ example: null, nullable: true })
  vehicleNumber!: string | null;

  @ApiProperty({ example: null, nullable: true })
  remark!: string | null;
}

export class AdminApplicationDetailResponseDto {
  @ApiProperty({ example: 503 })
  applicationId!: number;

  @ApiProperty({ example: 4 })
  retreatId!: number;

  @ApiProperty({ type: AdminApplicationDetailUserDto })
  user!: AdminApplicationDetailUserDto;

  @ApiProperty({ type: AdminApplicationDetailStatusDto })
  status!: AdminApplicationDetailStatusDto;

  @ApiProperty({ type: AdminApplicationDetailInfoDto })
  info!: AdminApplicationDetailInfoDto;

  // @ApiProperty({ type: [AdminApplicationAnswerDto] })
  // answers!: AdminApplicationAnswerDto[];

  @ApiProperty({ type: [AdminApplicationMealDto] })
  meals!: AdminApplicationMealDto[];

  @ApiProperty({ type: [AdminApplicationTransportDto] })
  transports!: AdminApplicationTransportDto[];

  @ApiProperty({
    example: null,
    nullable: true,
    description: '관리자 메모',
  })
  adminMemo!: string | null;
}
