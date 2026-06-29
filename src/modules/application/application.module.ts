import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from './domain/entities/application.entity';
import { Answer } from './domain/entities/answer.entity';
import { ApplicationController } from './presentation/controller/application.controller';
import { ApplicationAdminController } from './presentation/controller/application-admin.controller';
import { Survey } from './domain/entities/survey.entity';
import { Question } from './domain/entities/question.entity';
import { QuestionOption } from './domain/entities/question_option.entity';
import { SurveyController } from './presentation/controller/survey.controller';
import { QuestionController } from './presentation/controller/question.controller';
import { SurveyService } from './application/services/survey.service';
import { QuestionService } from './application/services/question.service';
import { QuestionMapper } from './presentation/mappers/question.mapper';
import { SurveyMapper } from './presentation/mappers/survey.mapper';
import { AdminSurveyController } from './presentation/controller/survey.admin.controller';
import { AdminQuestionController } from './presentation/controller/question.admin.controller';
import { CheckMyApplicationQuery } from './application/queries/me/check-my-application.query';
import { CheckMyApplicationPaidQuery } from './application/queries/me/check-my-application-paid.query';
import { GetMyApplicationHistoryQuery } from './application/queries/me/get-my-application-history.query';
import { GetMyApplicationDetailQuery } from './application/queries/me/get-my-application-detail.query';
import { PlayEventUseCase } from './application/usecases/me/play-event.usecase';
import { ScanApplicationQuery } from './application/queries/admin/scan-application.query';
import { GetAdminApplicationListQuery } from './application/queries/admin/get-admin-application-list.query';
import { GetAdminApplicationDetailQuery } from './application/queries/admin/get-admin-application-detail.query';
import { CheckInApplicationUseCase } from './application/usecases/admin/check-in-application.usecase';
import { Retreat } from '@modules/retreat/domain/entities/retreat.entity';
import { ApplicationMeal } from './domain/entities/application_meal.entity';
import { ApplicationTransport } from './domain/entities/application_transport.entity';
import { RetreatMeal } from '@modules/retreat/domain/entities/retreat_meal.entity';
import { RetreatTransport } from '@modules/retreat/domain/entities/retreat_transport.entity';
import { UpdateAdminApplicationUseCase } from './application/usecases/admin/update-admin-application.usecase';
import { GetApplicationOptionsQuery } from './application/queries/get-application-options.query';
import { GetApplicationFormQuery } from './application/queries/get-application-form.query';
import { UpsertMyApplicationUseCase } from './application/usecases/me/upsert-my-application.usecase';
import { SystemConfig } from '@modules/system/domain/entities/system-config.entity';
import { User } from '@modules/user/domain/entities/user.entity';
import { DeleteMyApplicationUseCase } from './application/usecases/me/delete-my-application.usecase';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Application,
      Answer,
      Survey,
      Question,
      QuestionOption,
      Retreat,
      RetreatMeal,
      RetreatTransport,
      ApplicationMeal,
      ApplicationTransport,
      SystemConfig,
      User,
    ]),
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
    GetAdminApplicationDetailQuery,
    CheckInApplicationUseCase,
    UpdateAdminApplicationUseCase,
    GetApplicationOptionsQuery,
    GetApplicationFormQuery,
    UpsertMyApplicationUseCase,
    DeleteMyApplicationUseCase,
    SurveyService,
    QuestionService,
    SurveyMapper,
    QuestionMapper,
  ],
})
export class ApplicationModule {}
