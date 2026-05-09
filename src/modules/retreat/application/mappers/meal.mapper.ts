import { Injectable } from '@nestjs/common';

import { RetreatMeal } from '@modules/retreat/domain/entities/retreat_meal.entity'; 
import { MealDto } from '@modules/retreat/presentation/dto/meal.dto';
import { MealCountResponseDto } from '@modules/retreat/presentation/dto/response/meal-count.response.dto';

@Injectable()
export class MealMapper {
  toDto(entity: RetreatMeal): MealDto {
    return {
      id: entity.id,
      retreatId: entity.retreatId,
      mealDay: entity.mealDay,
      mealType: entity.mealType,
      mealTable: entity.mealTable != null ? entity.mealTable : [],
    };
  }

  toDtoList(entities: RetreatMeal[]): MealDto[] {
    return entities.map((e) => this.toDto(e));
  }

  toMealCountDto(raw: any): MealCountResponseDto {
    return {
      mealDay: raw.mealDay,
      mealType: raw.mealType,
      count: Number(raw.count),
    };
  }

  toMealCountDtoList(raws: any[]): MealCountResponseDto[] {
    return raws.map((r) => this.toMealCountDto(r));
  }
}