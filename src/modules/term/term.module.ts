import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TermController } from './presentation/controllers/term.controller';
import { TermService } from './application/services/term.service';

import { TermMapper } from './application/mappers/term.mapper';
import { LectureMapper } from '@modules/lecture/application/mappers/lecture.mapper';

import { Term } from '@modules/term/domain/entities/term.entity';
import { Lecture } from '@modules/lecture/domain/entities/lecture.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Term, Lecture])],
  controllers: [TermController],
  providers: [TermService, TermMapper, LectureMapper],
})
export class TermModule {}
