import { Application } from '@modules/application/domain/entities/application.entity';
import { Survey } from '@modules/application/domain/entities/survey.entity';
import { Retreat } from '@modules/retreat/domain/entities/retreat.entity';
import { RetreatMeal } from '@modules/retreat/domain/entities/retreat_meal.entity';
import { RetreatTransport } from '@modules/retreat/domain/entities/retreat_transport.entity';
import { MealType } from '@modules/retreat/domain/enum/retreat-meal.enum';
import { TransportDirection } from '@modules/retreat/domain/enum/retreat-transport.enum';
import { SystemConfig } from '@modules/system/domain/entities/system-config.entity';
import {
  USER_GROUP_OPTIONS,
  UserGroup,
} from '@modules/user/domain/enums/user-group.enum';
import { User } from '@modules/user/domain/entities/user.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';
import { Not, Repository } from 'typeorm';
import { ApplicationStatus } from '@modules/application/domain/enum/application.enum';

const MEAL_TYPE_ORDER: Record<MealType, number> = {
  [MealType.BREAKFAST]: 0,
  [MealType.LUNCH]: 1,
  [MealType.DINNER]: 2,
};

export interface ApplicationFormResult {
  retreat: Retreat;
  survey: Survey;
  groups: typeof USER_GROUP_OPTIONS;
  currentGroup: UserGroup;
  meals: RetreatMeal[];
  departureTransports: RetreatTransport[];
  returnTransports: RetreatTransport[];
  myApplication: Application | null;
}

@Injectable()
export class GetApplicationFormQuery {
  constructor(
    @InjectRepository(SystemConfig)
    private readonly systemConfigRepository: Repository<SystemConfig>,
    @InjectRepository(Retreat)
    private readonly retreatRepository: Repository<Retreat>,
    @InjectRepository(Survey)
    private readonly surveyRepository: Repository<Survey>,
    @InjectRepository(RetreatMeal)
    private readonly mealRepository: Repository<RetreatMeal>,
    @InjectRepository(RetreatTransport)
    private readonly transportRepository: Repository<RetreatTransport>,
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async execute(
    userId: string,
    retreatId?: number,
  ): Promise<ApplicationFormResult> {
    const targetRetreatId = retreatId ?? (await this.getCurrentRetreatId());

    const [user, retreat, survey, meals, transports, myApplication] =
      await Promise.all([
        this.userRepository.findOneBy({ userId }),
        this.retreatRepository.findOneBy({ id: targetRetreatId }),
        this.surveyRepository.findOne({
          where: { retreatId: targetRetreatId },
          relations: ['questions', 'questions.options'],
          order: { id: 'ASC' },
        }),
        this.mealRepository.find({
          where: { retreatId: targetRetreatId },
          order: { mealDay: 'ASC', id: 'ASC' },
        }),
        this.transportRepository.find({
          where: { retreatId: targetRetreatId },
          order: { id: 'ASC' },
        }),
        this.applicationRepository.findOne({
          where: {
            userId,
            retreatId: targetRetreatId,
            status: Not(ApplicationStatus.CANCELED),
          },
          relations: ['applicationMeals', 'applicationTransports', 'answers'],
        }),
      ]);

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }
    if (!retreat) {
      throw new NotFoundException(ERROR_MESSAGES.RETREAT_NOT_FOUND);
    }
    if (!survey) {
      throw new NotFoundException(ERROR_MESSAGES.APPLICATION_FORM_NOT_FOUND);
    }

    meals.sort((a, b) => {
      const dayCompare = a.mealDay.localeCompare(b.mealDay);
      return (
        dayCompare || MEAL_TYPE_ORDER[a.mealType] - MEAL_TYPE_ORDER[b.mealType]
      );
    });

    return {
      retreat,
      survey,
      groups: USER_GROUP_OPTIONS,
      currentGroup: user.group,
      meals,
      departureTransports: transports.filter(
        (transport) => transport.direction === TransportDirection.DEPARTURE,
      ),
      returnTransports: transports.filter(
        (transport) => transport.direction === TransportDirection.RETURN,
      ),
      myApplication,
    };
  }

  private async getCurrentRetreatId(): Promise<number> {
    const config = await this.systemConfigRepository.findOneBy({ id: 1 });
    if (!config?.currentRetreatId) {
      throw new NotFoundException(ERROR_MESSAGES.CURRENT_RETREAT_NOT_FOUND);
    }
    return config.currentRetreatId;
  }
}
