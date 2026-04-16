import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Retreat } from './domain/entities/retreat.entity';
import { RetreatService } from './application/services/retreat.service';
import { RetreatController } from './presentation/controllers/retreat.controller';
import { RetreatMapper } from './application/mappers/retreat.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([Retreat])],
  controllers: [RetreatController],
  providers: [RetreatService, RetreatMapper],
  exports: [RetreatService],
})
export class RetreatModule {}
