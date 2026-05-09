import {
  Injectable,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RetreatMeal } from '@modules/retreat/domain/entities/retreat_meal.entity'; 
import { MealCreateRequestDto } from '../../presentation/dto/request/meal-create.request.dto';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';

@Injectable()
export class CreateMealUseCase {
  private readonly logger = new Logger(CreateMealUseCase.name);

  constructor(
    @InjectRepository(RetreatMeal)
    private readonly mealRepository: Repository<RetreatMeal>,
  ) {}

  async execute(dto: MealCreateRequestDto): Promise<RetreatMeal> {
    const existing = await this.mealRepository.findOne({
      where: {
        retreatId: dto.retreatId,
        mealDay: dto.mealDay,
        mealType: dto.mealType,
      },
    });

    if (existing) {
      throw new ConflictException(ERROR_MESSAGES.MEAL_SLOT_ALREADY_EXISTS);
    }

    const meal = this.mealRepository.create({
      retreatId: dto.retreatId,
      mealDay: dto.mealDay,
      mealType: dto.mealType,
      mealTable: dto.mealTable,
    });

    const saved = await this.mealRepository.save(meal);

    this.logger.log(
      `식사 생성 완료 - retreatId: ${dto.retreatId}, day: ${dto.mealDay}, type: ${dto.mealType}`,
    );

    return saved;
  }
}