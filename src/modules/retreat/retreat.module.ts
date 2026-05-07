import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Retreat } from './domain/entities/retreat.entity';
import { RetreatTransport } from './domain/entities/retreat_transport.entity';
import { ApplicationTransport } from '@modules/application/domain/entities/application_transport.entity';
import { RetreatService } from './application/services/retreat.service';
import { RetreatController } from './presentation/controllers/retreat.controller';
import { TransportController } from './presentation/controllers/transport.controller';
import { RetreatMapper } from './application/mappers/retreat.mapper';

import { CreateTransportUseCase } from './application/usecases/transport-create.usecase';
import { UpdateTransportUseCase } from './application/usecases/transport-update.usecase';
import { DeleteTransportUseCase } from './application/usecases/transport-delete.usecase';
import { GetTransportListQuery } from './application/queries/get-transport-list.query';
import { GetTransportQuery } from './application/queries/get-transport.query';

@Module({
  imports: [
    TypeOrmModule.forFeature([Retreat, RetreatTransport, ApplicationTransport]),
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
  ],
  exports: [RetreatService],
})
export class RetreatModule {}
