import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lecture } from './domain/entities/lecture.entity';
import { LectureEnrollment } from './domain/entities/lectureEnrollment.entity';
import { LectureService } from './application/services/lecture.service';
import { LectureController } from './presentation/controllers/lecture.controller';
import { LectureMapper } from './application/mappers/lecture.mapper';
import { Retreat } from '@modules/retreat/domain/entities/retreat.entity';
import { User } from '@modules/user/domain/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Lecture,
      LectureEnrollment,
      Retreat,
      User,
    ]),
  ],
  controllers: [LectureController],
  providers: [LectureService, LectureMapper],
})
export class LectureModule {}
