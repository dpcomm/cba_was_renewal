import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from './domain/entities/application.entity';
import { ApplicationController } from './presentation/controller/application.controller';
import { ApplicationService } from './application/services/application.service';
import { Survey } from './domain/entities/survey.entity';
import { Question } from './domain/entities/question.entity';
import { QuestionOption } from './domain/entities/question_option.entity';
import { SurveyController } from './presentation/controller/survey.controller';
import { QuestionController } from './presentation/controller/question.controller';
import { SurveyService } from './application/services/survey.service';
import { QuestionService } from './application/services/question.service';
import { QuestionMapper } from './application/mappers/question.mapper';
import { SurveyMapper } from './application/mappers/survey.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([Application, Survey, Question, QuestionOption])],
  controllers: [ApplicationController, SurveyController, QuestionController],
  providers: [ApplicationService, SurveyService, QuestionService, SurveyMapper, QuestionMapper],
})
export class ApplicationModule {}
