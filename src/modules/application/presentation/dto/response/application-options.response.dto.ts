import { ApplicationOptionsResult } from '@modules/application/application/queries/get-application-options.query';
import { MealType } from '@modules/retreat/domain/enum/retreat-meal.enum';
import { TransportType } from '@modules/retreat/domain/enum/retreat-transport.enum';
import { UserGroup } from '@modules/user/domain/enums/user-group.enum';
import { ApiProperty } from '@nestjs/swagger';

export class ApplicationOptionRetreatResponseDto {
  @ApiProperty({ example: 4 })
  id: number;

  @ApiProperty({ example: '2026 여름 수련회' })
  title: string;

  @ApiProperty({ example: '2026-08-14T00:00:00.000Z' })
  startAt: Date;

  @ApiProperty({ example: '2026-08-16T09:00:00.000Z' })
  endAt: Date;

  constructor(result: ApplicationOptionsResult['retreat']) {
    const representativeSurvey = result.surveys
      ?.slice()
      .sort((a, b) => a.id - b.id)[0];

    this.id = result.id;
    this.title = result.title;
    this.startAt = representativeSurvey?.surveyStartAt ?? result.retreatStartAt;
    this.endAt = representativeSurvey?.surveyEndAt ?? result.retreatEndAt;
  }
}

export class ApplicationOptionGroupResponseDto {
  @ApiProperty({
    enum: UserGroup,
    example: UserGroup.KWON_SOON_YOUNG_AND_LIM_KANG_MI_M,
  })
  value: UserGroup;

  @ApiProperty({ example: '권수영&임강미M' })
  label: string;

  constructor(value: UserGroup, label: string) {
    this.value = value;
    this.label = label;
  }
}

export class ApplicationOptionMealResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '2026-08-14' })
  mealDay: string;

  @ApiProperty({ enum: MealType, example: MealType.DINNER })
  mealType: MealType;

  constructor(id: number, mealDay: string, mealType: MealType) {
    this.id = id;
    this.mealDay = mealDay;
    this.mealType = mealType;
  }
}

export class ApplicationOptionTransportResponseDto {
  @ApiProperty({ example: 10 })
  id: number;

  @ApiProperty({ enum: TransportType, example: TransportType.BUS })
  transportType: TransportType;

  @ApiProperty({ example: '교회 출발 버스' })
  name: string;

  @ApiProperty({ example: false })
  isVehicleRequired: boolean;

  @ApiProperty({ example: false })
  isRemarkRequired: boolean;

  constructor(result: ApplicationOptionsResult['departureTransports'][number]) {
    this.id = result.id;
    this.transportType = result.transportType;
    this.name = result.name;
    this.isVehicleRequired = result.isVehicleRequired;
    this.isRemarkRequired = result.isRemarkRequired;
  }
}

export class ApplicationOptionTransportsResponseDto {
  @ApiProperty({ type: [ApplicationOptionTransportResponseDto] })
  departure: ApplicationOptionTransportResponseDto[];

  @ApiProperty({ type: [ApplicationOptionTransportResponseDto] })
  return: ApplicationOptionTransportResponseDto[];

  constructor(result: ApplicationOptionsResult) {
    this.departure = result.departureTransports.map(
      (transport) => new ApplicationOptionTransportResponseDto(transport),
    );
    this.return = result.returnTransports.map(
      (transport) => new ApplicationOptionTransportResponseDto(transport),
    );
  }
}

export class ApplicationOptionsResponseDto {
  @ApiProperty({ type: ApplicationOptionRetreatResponseDto })
  retreat: ApplicationOptionRetreatResponseDto;

  @ApiProperty({ type: [ApplicationOptionGroupResponseDto] })
  groups: ApplicationOptionGroupResponseDto[];

  @ApiProperty({ type: [ApplicationOptionMealResponseDto] })
  meals: ApplicationOptionMealResponseDto[];

  @ApiProperty({ type: ApplicationOptionTransportsResponseDto })
  transports: ApplicationOptionTransportsResponseDto;

  constructor(result: ApplicationOptionsResult) {
    this.retreat = new ApplicationOptionRetreatResponseDto(result.retreat);
    this.groups = result.groups.map(
      (group) =>
        new ApplicationOptionGroupResponseDto(group.value, group.label),
    );
    this.meals = result.meals.map(
      (meal) =>
        new ApplicationOptionMealResponseDto(
          meal.id,
          meal.mealDay,
          meal.mealType,
        ),
    );
    this.transports = new ApplicationOptionTransportsResponseDto(result);
  }
}
