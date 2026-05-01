import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RetreatMeal } from '@modules/retreat/domain/entities/retreat_meal.entity'; 
import { MealUpdateRequestDto } from '../dto/meal.update.request.dto';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';

@Injectable()
export class UpdateMealUseCase {
  private readonly logger = new Logger(UpdateMealUseCase.name);

  constructor(
    @InjectRepository(RetreatMeal)
    private readonly mealRepository: Repository<RetreatMeal>,
  ) {}

  async execute(dto: MealUpdateRequestDto): Promise<RetreatMeal> {
    const meal = await this.mealRepository.findOne({
      where: { id: dto.id },
    });

    if (!meal) {
      throw new NotFoundException(ERROR_MESSAGES.MEAL_NOT_FOUND);
    }

    meal.mealTable = dto.mealTable;

    const updated = await this.mealRepository.save(meal);

    this.logger.log(`식사 수정 완료 - ID: ${dto.id}`);

    return updated;
  }
}