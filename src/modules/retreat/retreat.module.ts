import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Retreat } from './domain/entities/retreat.entity';
import { RetreatService } from './application/services/retreat.service';
import { RetreatController } from './presentation/controllers/retreat.controller';
import { RetreatMapper } from './application/mappers/retreat.mapper';
import { AdminMealController } from './presentation/controllers/meal.admin.controller';
import { MealMapper } from './application/mappers/meal.mapper';
import { GetMealCountQuery } from './application/query/get-meal-count.query';
import { GetMealListQuery } from './application/query/get-meal-list.query';
import { CreateMealUseCase } from './application/usecase/meal.create.usecase';
import { DeleteMealUseCase } from './application/usecase/meal.delete.usecase';
import { UpdateMealUseCase } from './application/usecase/meal.update.usecase';
import { RetreatMeal } from './domain/entities/retreat_meal.entity';
import { ApplicationMeal } from '@modules/application/domain/entities/application_meal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Retreat, RetreatMeal, ApplicationMeal])],
  controllers: [RetreatController, AdminMealController],
  providers: [RetreatService, RetreatMapper, 
    MealMapper,
    GetMealCountQuery, GetMealListQuery,
    CreateMealUseCase, DeleteMealUseCase, UpdateMealUseCase,
  ],
  exports: [RetreatService],
})
export class RetreatModule {}
