import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Retreat } from './domain/entities/retreat.entity';
import { RetreatTransport } from './domain/entities/retreat_transport.entity';
import { ApplicationTransport } from '@modules/application/domain/entities/application_transport.entity';
import { RetreatService } from './application/services/retreat.service';
import { RetreatController } from './presentation/controllers/retreat.controller';
import { TransportController } from './presentation/controllers/transport.controller';
import { RetreatMapper } from './application/mappers/retreat.mapper';
import { GetMealCountQuery } from './application/query/get-meal-count.query';
import { GetMealListQuery } from './application/query/get-meal-list.query';
import { CreateMealUseCase } from './application/usecase/meal.create.usecase';
import { DeleteMealUseCase } from './application/usecase/meal.delete.usecase';
import { UpdateMealUseCase } from './application/usecase/meal.update.usecase';
import { RetreatMeal } from './domain/entities/retreat_meal.entity';
import { ApplicationMeal } from '@modules/application/domain/entities/application_meal.entity';

import { CreateTransportUseCase } from './application/usecases/transport-create.usecase';
import { UpdateTransportUseCase } from './application/usecases/transport-update.usecase';
import { DeleteTransportUseCase } from './application/usecases/transport-delete.usecase';
import { GetTransportListQuery } from './application/queries/get-transport-list.query';
import { GetTransportQuery } from './application/queries/get-transport.query';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Retreat,
      RetreatTransport,
      ApplicationTransport,
      RetreatMeal,
      ApplicationMeal,
    ]),
  ],
  controllers: [RetreatController, TransportController],
  providers: [
    RetreatService,
    RetreatMapper,
    CreateTransportUseCase,
    UpdateTransportUseCase,
    DeleteTransportUseCase,
    GetTransportQuery,
    GetTransportListQuery,
    GetMealCountQuery,
    GetMealListQuery,
    CreateMealUseCase,
    DeleteMealUseCase,
    UpdateMealUseCase,
  ],
  exports: [RetreatService],
})
export class RetreatModule {}
