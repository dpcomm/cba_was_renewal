import { ApplicationFormResult } from '@modules/application/application/queries/get-application-form.query';
import { UserGroup } from '@modules/user/domain/enums/user-group.enum';
import { ApiProperty } from '@nestjs/swagger';
import {
  ApplicationFormGroupDto,
  ApplicationFormMealDto,
  ApplicationFormRetreatDto,
  ApplicationFormSurveyDto,
  ApplicationFormTransportsDto,
  MyApplicationFormDto,
} from './application-form-sub.response.dto';

export class ApplicationFormResponseDto {
  @ApiProperty({ type: ApplicationFormRetreatDto })
  retreat: ApplicationFormRetreatDto;

  @ApiProperty({ type: ApplicationFormSurveyDto })
  survey: ApplicationFormSurveyDto;

  @ApiProperty({ type: [ApplicationFormGroupDto] })
  groups: ApplicationFormGroupDto[];

  @ApiProperty({ enum: UserGroup })
  currentGroup: UserGroup;

  @ApiProperty({ type: [ApplicationFormMealDto] })
  meals: ApplicationFormMealDto[];

  @ApiProperty({ type: ApplicationFormTransportsDto })
  transports: ApplicationFormTransportsDto;

  @ApiProperty({ type: MyApplicationFormDto, nullable: true })
  myApplication: MyApplicationFormDto | null;

  constructor(result: ApplicationFormResult) {
    this.retreat = {
      id: result.retreat.id,
      title: result.retreat.title,
      location: result.retreat.location,
      retreatStartAt: result.retreat.retreatStartAt,
      retreatEndAt: result.retreat.retreatEndAt,
    };
    this.survey = {
      id: result.survey.id,
      title: result.survey.title,
      surveyStartAt: result.survey.surveyStartAt,
      surveyEndAt: result.survey.surveyEndAt,
      questions: (result.survey.questions ?? [])
        .slice()
        .sort((a, b) => a.orderNo - b.orderNo)
        .map((question) => ({
          id: question.id,
          title: question.title,
          answerType: question.answerType,
          isRequired: question.isRequired,
          orderNo: question.orderNo,
          options: (question.options ?? [])
            .slice()
            .sort((a, b) => a.orderNo - b.orderNo)
            .map((option) => ({
              id: option.id,
              label: option.label,
              orderNo: option.orderNo,
            })),
        })),
    };
    this.groups = result.groups;
    this.currentGroup = result.currentGroup;
    this.meals = result.meals.map((meal) => ({
      id: meal.id,
      mealDay: meal.mealDay,
      mealType: meal.mealType,
    }));
    this.transports = {
      departure: result.departureTransports.map((transport) => ({
        id: transport.id,
        direction: transport.direction,
        transportType: transport.transportType,
        name: transport.name,
        isVehicleRequired: transport.isVehicleRequired,
        isRemarkRequired: transport.isRemarkRequired,
      })),
      return: result.returnTransports.map((transport) => ({
        id: transport.id,
        direction: transport.direction,
        transportType: transport.transportType,
        name: transport.name,
        isVehicleRequired: transport.isVehicleRequired,
        isRemarkRequired: transport.isRemarkRequired,
      })),
    };
    this.myApplication = result.myApplication
      ? {
          id: result.myApplication.id,
          retreatMealIds: result.myApplication.applicationMeals.map(
            (meal) => meal.retreatMealId,
          ),
          transports: result.myApplication.applicationTransports.map(
            (transport) => ({
              retreatTransportId: transport.retreatTransportId,
              vehicleNumber: transport.vehicleNumber,
              remark: transport.remark,
            }),
          ),
          answers: result.myApplication.answers.map((answer) => ({
            questionId: answer.questionId,
            questionOptionId: answer.questionOptionId,
            content: answer.content,
          })),
        }
      : null;
  }
}
