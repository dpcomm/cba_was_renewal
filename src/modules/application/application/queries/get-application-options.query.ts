import { Retreat } from '@modules/retreat/domain/entities/retreat.entity';
import { RetreatMeal } from '@modules/retreat/domain/entities/retreat_meal.entity';
import { RetreatTransport } from '@modules/retreat/domain/entities/retreat_transport.entity';
import { MealType } from '@modules/retreat/domain/enum/retreat-meal.enum';
import { TransportDirection } from '@modules/retreat/domain/enum/retreat-transport.enum';
import {
  USER_GROUP_OPTIONS,
  UserGroup,
} from '@modules/user/domain/enums/user-group.enum';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';
import { Repository } from 'typeorm';

const MEAL_TYPE_ORDER: Record<MealType, number> = {
  [MealType.BREAKFAST]: 0,
  [MealType.LUNCH]: 1,
  [MealType.DINNER]: 2,
};

export interface ApplicationOptionGroup {
  value: UserGroup;
  label: string;
}

export interface ApplicationOptionsResult {
  retreat: Retreat;
  groups: ApplicationOptionGroup[];
  meals: RetreatMeal[];
  departureTransports: RetreatTransport[];
  returnTransports: RetreatTransport[];
}

@Injectable()
export class GetApplicationOptionsQuery {
  constructor(
    @InjectRepository(Retreat)
    private readonly retreatRepository: Repository<Retreat>,
    @InjectRepository(RetreatMeal)
    private readonly mealRepository: Repository<RetreatMeal>,
    @InjectRepository(RetreatTransport)
    private readonly transportRepository: Repository<RetreatTransport>,
  ) {}

  async execute(retreatId: number): Promise<ApplicationOptionsResult> {
    const [retreat, meals, transports] = await Promise.all([
      this.retreatRepository.findOneBy({ id: retreatId }),
      this.mealRepository.find({
        where: { retreatId },
        order: { mealDay: 'ASC', id: 'ASC' },
      }),
      this.transportRepository.find({
        where: { retreatId },
        order: { id: 'ASC' },
      }),
    ]);

    if (!retreat) {
      throw new NotFoundException(ERROR_MESSAGES.RETREAT_NOT_FOUND);
    }

    meals.sort((a, b) => {
      const dayCompare = a.mealDay.localeCompare(b.mealDay);
      return (
        dayCompare || MEAL_TYPE_ORDER[a.mealType] - MEAL_TYPE_ORDER[b.mealType]
      );
    });

    return {
      retreat,
      groups: USER_GROUP_OPTIONS.map((group) => ({
        value: group.value,
        label: group.label,
      })),
      meals,
      departureTransports: transports.filter(
        (transport) => transport.direction === TransportDirection.DEPARTURE,
      ),
      returnTransports: transports.filter(
        (transport) => transport.direction === TransportDirection.RETURN,
      ),
    };
  }
}
