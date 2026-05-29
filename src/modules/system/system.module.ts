import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemConfig } from '@modules/system/domain/entities/system-config.entity';
import { SystemService } from '@modules/system/application/services/system.service';
import {
  AdminSystemController,
  SystemController,
} from '@modules/system/presentation/controller/system.controller';
import { Term } from '@modules/term/domain/entities/term.entity';
import { Retreat } from '@modules/retreat/domain/entities/retreat.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SystemConfig, Term, Retreat])],
  controllers: [SystemController, AdminSystemController],
  providers: [SystemService],
  exports: [SystemService],
})
export class SystemModule {}
