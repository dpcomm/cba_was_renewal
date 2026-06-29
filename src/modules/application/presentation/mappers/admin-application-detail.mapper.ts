import { Application } from '@modules/application/domain/entities/application.entity';
import { AdminApplicationDetailResponseDto } from '../dto/response/admin-application-detail.response.dto';

export class AdminApplicationDetailMapper {
  static toDto(application: Application): AdminApplicationDetailResponseDto {
    return {
      applicationId: application.id,
      retreatId: application.retreatId,
      user: {
        userId: application.user.userId,
        name: application.user.name,
        group: application.user.group,
        gender: application.user.gender,
        birth: application.user.birth,
        phone: application.user.phone,
      },
      status: {
        applicationStatus: application.status,
        paymentStatus: application.paymentStatus,
        checkedInAt: application.checkedInAt,
      },
      info: {
        appliedAt: application.createdAt,
        paymentStatus: application.paymentStatus,
        checkedInAt: application.checkedInAt,
        survey: {
          id: application.survey.id,
          title: application.survey.title,
        },
      },
      meals: application.applicationMeals
        .map((applicationMeal) => ({
          applicationMealId: applicationMeal.id,
          retreatMealId: applicationMeal.retreatMealId,
          mealDay: applicationMeal.retreatMeal.mealDay,
          mealType: applicationMeal.retreatMeal.mealType,
        }))
        .sort((a, b) => {
          const dayCompare = a.mealDay.localeCompare(b.mealDay);
          return dayCompare !== 0
            ? dayCompare
            : a.mealType.localeCompare(b.mealType);
        }),
      transports: application.applicationTransports
        .map((applicationTransport) => ({
          applicationTransportId: applicationTransport.id,
          retreatTransportId: applicationTransport.retreatTransportId,
          direction: applicationTransport.direction,
          transportType: applicationTransport.retreatTransport.transportType,
          name: applicationTransport.retreatTransport.name,
          vehicleNumber: applicationTransport.vehicleNumber,
          remark: applicationTransport.remark,
        }))
        .sort((a, b) => {
          const directionCompare = a.direction.localeCompare(b.direction);
          return directionCompare !== 0
            ? directionCompare
            : a.transportType.localeCompare(b.transportType);
        }),
      adminMemo: application.adminMemo,
    };
  }
}
