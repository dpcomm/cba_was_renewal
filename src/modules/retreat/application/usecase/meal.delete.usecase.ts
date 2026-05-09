import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RetreatMeal } from '@modules/retreat/domain/entities/retreat_meal.entity'; 
import { ApplicationMeal } from '@modules/application/domain/entities/application_meal.entity';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';

@Injectable()
export class DeleteMealUseCase {
  private readonly logger = new Logger(DeleteMealUseCase.name);

  constructor(
    @InjectRepository(RetreatMeal)
    private readonly mealRepository: Repository<RetreatMeal>,

    @InjectRepository(ApplicationMeal)
    private readonly applicationMealRepository: Repository<ApplicationMeal>,
  ) {}

  async execute(id: number): Promise<void> {
    const meal = await this.mealRepository.findOne({
      where: { id },
    });

    if (!meal) {
      throw new NotFoundException(ERROR_MESSAGES.MEAL_NOT_FOUND);
    }

    const count = await this.applicationMealRepository.count({
      where: {
        retreatMeal: {
          id: meal.id,
        },
      },
    });

    if (count > 0) {
      throw new ConflictException(ERROR_MESSAGES.CANNOT_DELETE_MEAL_WITH_APPLICATIONS);
    }

    await this.mealRepository.delete(id);

    this.logger.log(`식사 삭제 완료 - ID: ${id}`);
  }
}