import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RetreatMeal } from '@modules/retreat/domain/entities/retreat_meal.entity'; 

@Injectable()
export class GetMealCountQuery {
  constructor(
    @InjectRepository(RetreatMeal)
    private readonly mealRepository: Repository<RetreatMeal>,
  ) {}

  async execute(retreatId: number) {
    const result = await this.mealRepository
      .createQueryBuilder('rm')
      .leftJoin('rm.applicationMeals', 'am') // ⭐ 핵심 수정
      .select('rm.mealDay', 'mealDay')
      .addSelect('rm.mealType', 'mealType')
      .addSelect('COUNT(am.id)', 'count')
      .where('rm.retreatId = :retreatId', { retreatId })
      .groupBy('rm.id')
      .addGroupBy('rm.mealDay')
      .addGroupBy('rm.mealType')
      .orderBy('rm.mealDay', 'ASC')
      .addOrderBy('rm.mealType', 'ASC')
      .getRawMany();

    return result.map((r) => ({
      mealDay: r.mealDay,
      mealType: r.mealType,
      count: Number(r.count),
    }));
  }
}