import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemConfig } from '@modules/system/domain/entities/system-config.entity';
import {
  AdminSystemController,
  SystemController,
} from '@modules/system/presentation/controller/system.controller';
import { Term } from '@modules/term/domain/entities/term.entity';
import { Retreat } from '@modules/retreat/domain/entities/retreat.entity';
import { GetSystemConfigQuery } from './application/queries/get-system-config.query';
import { GetSystemConfigOptionsQuery } from './application/queries/get-system-config-options.query';
import { UpdateSystemConfigUseCase } from './application/usecases/update-system-config.usecase';

const queries = [GetSystemConfigQuery, GetSystemConfigOptionsQuery];
const useCases = [UpdateSystemConfigUseCase];

@Module({
  imports: [TypeOrmModule.forFeature([SystemConfig, Term, Retreat])],
  controllers: [SystemController, AdminSystemController],
  providers: [...queries, ...useCases],
  exports: [GetSystemConfigQuery],
})
export class SystemModule {}
