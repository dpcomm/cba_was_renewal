import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RetreatMeal } from '@modules/retreat/domain/entities/retreat_meal.entity'; 
import { MealListRequestDto } from '../dto/meal.get.request.dto';

@Injectable()
export class GetMealListQuery {
  constructor(
    @InjectRepository(RetreatMeal)
    private readonly mealRepository: Repository<RetreatMeal>,
  ) {}

  async execute(dto: MealListRequestDto): Promise<RetreatMeal[]> {
    const where: any = {};

    if (dto.retreatId !== undefined) {
        where.retreatId = dto.retreatId;
    }

    if (dto.mealDay) {
        where.mealDay = dto.mealDay;
    }

    if (dto.mealType !== undefined) {
        where.mealType = dto.mealType;
    }

    return await this.mealRepository.find({
      where,
      order: {
        mealDay: 'ASC',
      },
    });
  }
}