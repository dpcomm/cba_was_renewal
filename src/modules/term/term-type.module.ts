import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TermType } from '@modules/term/domain/entities/term-type.entity';
import { TermTypeController } from './presentation/controllers/term-type.controller';
import { TermTypeService } from './application/services/term-type.service';
import { TermTypeMapper } from './application/mappers/term-type.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([TermType])],
  controllers: [TermTypeController],
  providers: [TermTypeService, TermTypeMapper],
})

export class TermTypeModule {}