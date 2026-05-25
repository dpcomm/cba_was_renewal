import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from './domain/entities/application.entity';
import { ApplicationController } from './presentation/controller/application.controller';
import { ApplicationAdminController } from './presentation/controller/application-admin.controller';
import { Survey } from './domain/entities/survey.entity';
import { Question } from './domain/entities/question.entity';
import { QuestionOption } from './domain/entities/question_option.entity';
import { SurveyController } from './presentation/controller/survey.controller';
import { QuestionController } from './presentation/controller/question.controller';
import { SurveyService } from './application/services/survey.service';
import { QuestionService } from './application/services/question.service';
import { QuestionMapper } from './application/mappers/question.mapper';
import { SurveyMapper } from './application/mappers/survey.mapper';
import { AdminSurveyController } from './presentation/controller/survey.admin.controller';
import { AdminQuestionController } from './presentation/controller/question.admin.controller';
import { CheckMyApplicationQuery } from './application/queries/me/check-my-application.query';
import { CheckMyApplicationPaidQuery } from './application/queries/me/check-my-application-paid.query';
import { GetMyApplicationHistoryQuery } from './application/queries/me/get-my-application-history.query';
import { GetMyApplicationDetailQuery } from './application/queries/me/get-my-application-detail.query';
import { PlayEventUseCase } from './application/usecases/me/play-event.usecase';
import { ScanApplicationQuery } from './application/queries/admin/scan-application.query';
import { GetAdminApplicationListQuery } from './application/queries/admin/get-admin-application-list.query';
import { CheckInApplicationUseCase } from './application/usecases/admin/check-in-application.usecase';

@Module({
  imports: [
    TypeOrmModule.forFeature([Application, Survey, Question, QuestionOption]),
  ],
  controllers: [
    ApplicationController,
    ApplicationAdminController,
    SurveyController,
    QuestionController,
    AdminSurveyController,
    AdminQuestionController,
  ],
  providers: [
    CheckMyApplicationQuery,
    CheckMyApplicationPaidQuery,
    GetMyApplicationHistoryQuery,
    GetMyApplicationDetailQuery,
    PlayEventUseCase,
    ScanApplicationQuery,
    GetAdminApplicationListQuery,
    CheckInApplicationUseCase,
    SurveyService,
    QuestionService,
    SurveyMapper,
    QuestionMapper,
  ],
})
export class ApplicationModule {}
