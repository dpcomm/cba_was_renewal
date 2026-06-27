import { Answer } from '@modules/application/domain/entities/answer.entity';
import { Application } from '@modules/application/domain/entities/application.entity';
import { ApplicationMeal } from '@modules/application/domain/entities/application_meal.entity';
import { ApplicationTransport } from '@modules/application/domain/entities/application_transport.entity';
import { Question } from '@modules/application/domain/entities/question.entity';
import { Survey } from '@modules/application/domain/entities/survey.entity';
import { ApplicationStatus } from '@modules/application/domain/enum/application.enum';
import { AnswerType } from '@modules/application/domain/enum/survey.enum';
import { Retreat } from '@modules/retreat/domain/entities/retreat.entity';
import { RetreatMeal } from '@modules/retreat/domain/entities/retreat_meal.entity';
import { RetreatTransport } from '@modules/retreat/domain/entities/retreat_transport.entity';
import { TransportDirection } from '@modules/retreat/domain/enum/retreat-transport.enum';
import { User } from '@modules/user/domain/entities/user.entity';
import { UserGroup } from '@modules/user/domain/enums/user-group.enum';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';
import { DataSource, EntityManager, In } from 'typeorm';

export interface UpsertMyApplicationTransportCommand {
  retreatTransportId: number;
  vehicleNumber?: string | null;
  remark?: string | null;
}

export interface UpsertMyApplicationAnswerCommand {
  questionId: number;
  questionOptionId?: number | null;
  content?: string | null;
}

export interface UpsertMyApplicationCommand {
  group: UserGroup;
  surveyId: number;
  retreatMealIds?: number[];
  transports?: UpsertMyApplicationTransportCommand[];
  answers?: UpsertMyApplicationAnswerCommand[];
}

export interface UpsertMyApplicationResult {
  applicationId: number;
  retreatId: number;
  surveyId: number;
  status: ApplicationStatus;
}

interface ValidatedTransport {
  retreatTransportId: number;
  direction: TransportDirection;
  vehicleNumber: string | null;
  remark: string | null;
}

interface ValidatedAnswer {
  questionId: number;
  questionOptionId: number | null;
  content: string | null;
}

@Injectable()
export class UpsertMyApplicationUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(
    userId: string,
    retreatId: number,
    command: UpsertMyApplicationCommand,
  ): Promise<UpsertMyApplicationResult> {
    return this.dataSource.transaction(async (manager) => {
      const [user, retreat, survey] = await Promise.all([
        manager.findOne(User, { where: { userId } }),
        manager.findOne(Retreat, { where: { id: retreatId } }),
        manager.findOne(Survey, {
          where: { id: command.surveyId },
          relations: ['questions', 'questions.options'],
        }),
      ]);

      if (!user) {
        throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
      }
      if (!retreat) {
        throw new NotFoundException(ERROR_MESSAGES.RETREAT_NOT_FOUND);
      }
      if (!survey || survey.retreatId !== retreatId) {
        throw new NotFoundException(ERROR_MESSAGES.APPLICATION_FORM_NOT_FOUND);
      }

      this.validateApplicationPeriod(survey);

      const application = await this.findOrCreateApplication(
        manager,
        userId,
        retreatId,
        survey.id,
      );

      if (application.status === ApplicationStatus.CHECKED_IN) {
        throw new ConflictException(
          ERROR_MESSAGES.CHECKED_IN_APPLICATION_UPDATE_NOT_ALLOWED,
        );
      }

      const mealIds = await this.validateMeals(
        manager,
        retreatId,
        command.retreatMealIds ?? [],
      );
      const transports = await this.validateTransports(
        manager,
        retreatId,
        command.transports ?? [],
      );
      const answers = this.validateAnswers(
        survey.questions ?? [],
        command.answers ?? [],
      );

      user.group = command.group;
      await manager.save(User, user);

      application.surveyId = survey.id;
      application.status = ApplicationStatus.SUBMITTED;
      application.checkedInAt = null;
      const savedApplication = await manager.save(Application, application);

      await manager.delete(ApplicationMeal, {
        applicationId: savedApplication.id,
      });
      await manager.delete(ApplicationTransport, {
        applicationId: savedApplication.id,
      });
      await manager.delete(Answer, { applicationId: savedApplication.id });

      if (mealIds.length) {
        await manager.save(
          ApplicationMeal,
          mealIds.map((retreatMealId) =>
            manager.create(ApplicationMeal, {
              applicationId: savedApplication.id,
              retreatMealId,
            }),
          ),
        );
      }

      if (transports.length) {
        await manager.save(
          ApplicationTransport,
          transports.map((transport) =>
            manager.create(ApplicationTransport, {
              applicationId: savedApplication.id,
              ...transport,
            }),
          ),
        );
      }

      if (answers.length) {
        await manager.save(
          Answer,
          answers.map((answer) =>
            manager.create(Answer, {
              applicationId: savedApplication.id,
              ...answer,
            }),
          ),
        );
      }

      return {
        applicationId: savedApplication.id,
        retreatId: savedApplication.retreatId,
        surveyId: savedApplication.surveyId,
        status: savedApplication.status,
      };
    });
  }

  private async findOrCreateApplication(
    manager: EntityManager,
    userId: string,
    retreatId: number,
    surveyId: number,
  ): Promise<Application> {
    const existing = await manager.findOne(Application, {
      where: { userId, retreatId },
      lock: { mode: 'pessimistic_write' },
    });

    if (existing) {
      return existing;
    }

    return manager.create(Application, {
      userId,
      retreatId,
      surveyId,
      status: ApplicationStatus.SUBMITTED,
    });
  }

  private validateApplicationPeriod(survey: Survey): void {
    const now = Date.now();
    if (
      now < survey.surveyStartAt.getTime() ||
      now > survey.surveyEndAt.getTime()
    ) {
      throw new BadRequestException(ERROR_MESSAGES.APPLICATION_PERIOD_CLOSED);
    }
  }

  private async validateMeals(
    manager: EntityManager,
    retreatId: number,
    retreatMealIds: number[],
  ): Promise<number[]> {
    const uniqueIds = [...new Set(retreatMealIds)];
    if (uniqueIds.length !== retreatMealIds.length) {
      throw new BadRequestException(
        ERROR_MESSAGES.INVALID_APPLICATION_MEAL_SELECTION,
      );
    }

    const meals = uniqueIds.length
      ? await manager.find(RetreatMeal, { where: { id: In(uniqueIds) } })
      : [];
    if (
      meals.length !== uniqueIds.length ||
      meals.some((meal) => meal.retreatId !== retreatId)
    ) {
      throw new BadRequestException(
        ERROR_MESSAGES.INVALID_APPLICATION_MEAL_SELECTION,
      );
    }

    return uniqueIds;
  }

  private async validateTransports(
    manager: EntityManager,
    retreatId: number,
    commands: UpsertMyApplicationTransportCommand[],
  ): Promise<ValidatedTransport[]> {
    const ids = commands.map((command) => command.retreatTransportId);
    if (new Set(ids).size !== ids.length) {
      throw new BadRequestException(
        ERROR_MESSAGES.INVALID_APPLICATION_TRANSPORT_SELECTION,
      );
    }

    const options = ids.length
      ? await manager.find(RetreatTransport, { where: { id: In(ids) } })
      : [];
    if (
      options.length !== ids.length ||
      options.some((option) => option.retreatId !== retreatId)
    ) {
      throw new BadRequestException(
        ERROR_MESSAGES.INVALID_APPLICATION_TRANSPORT_SELECTION,
      );
    }

    if (
      new Set(options.map((option) => option.direction)).size !== ids.length
    ) {
      throw new BadRequestException(
        ERROR_MESSAGES.INVALID_APPLICATION_TRANSPORT_SELECTION,
      );
    }

    const optionById = new Map(options.map((option) => [option.id, option]));
    return commands.map((command) => {
      const option = optionById.get(command.retreatTransportId)!;
      const vehicleNumber = command.vehicleNumber?.trim() || null;
      const remark = command.remark?.trim() || null;

      if (option.isVehicleRequired && !vehicleNumber) {
        throw new BadRequestException(
          ERROR_MESSAGES.TRANSPORT_VEHICLE_NUMBER_REQUIRED,
        );
      }
      if (option.isRemarkRequired && !remark) {
        throw new BadRequestException(ERROR_MESSAGES.TRANSPORT_REMARK_REQUIRED);
      }

      return {
        retreatTransportId: option.id,
        direction: option.direction,
        vehicleNumber,
        remark,
      };
    });
  }

  private validateAnswers(
    questions: Question[],
    commands: UpsertMyApplicationAnswerCommand[],
  ): ValidatedAnswer[] {
    const questionById = new Map(
      questions.map((question) => [question.id, question]),
    );
    const answersByQuestionId = new Map<
      number,
      UpsertMyApplicationAnswerCommand[]
    >();

    for (const command of commands) {
      const question = questionById.get(command.questionId);
      if (!question) {
        throw new BadRequestException(
          ERROR_MESSAGES.INVALID_APPLICATION_ANSWER,
        );
      }
      answersByQuestionId.set(command.questionId, [
        ...(answersByQuestionId.get(command.questionId) ?? []),
        command,
      ]);
    }

    const normalized: ValidatedAnswer[] = [];
    for (const question of questions) {
      const answers = answersByQuestionId.get(question.id) ?? [];
      if (question.isRequired && answers.length === 0) {
        throw new BadRequestException(
          ERROR_MESSAGES.REQUIRED_APPLICATION_ANSWER_MISSING,
        );
      }
      normalized.push(...this.validateQuestionAnswers(question, answers));
    }

    return normalized;
  }

  private validateQuestionAnswers(
    question: Question,
    answers: UpsertMyApplicationAnswerCommand[],
  ): ValidatedAnswer[] {
    switch (question.answerType) {
      case AnswerType.SUBJECTIVE:
        return this.validateSubjectiveAnswer(question, answers);
      case AnswerType.SINGLE_SELECT:
        return this.validateSingleSelectAnswer(question, answers);
      case AnswerType.MULTI_SELECT:
        return this.validateMultiSelectAnswer(question, answers);
    }
  }

  private validateSubjectiveAnswer(
    question: Question,
    answers: UpsertMyApplicationAnswerCommand[],
  ): ValidatedAnswer[] {
    if (answers.length === 0) {
      return [];
    }
    if (
      answers.length !== 1 ||
      (answers[0].questionOptionId !== undefined &&
        answers[0].questionOptionId !== null)
    ) {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_APPLICATION_ANSWER);
    }

    const content = answers[0].content?.trim() || '';
    if (!content) {
      throw new BadRequestException(
        question.isRequired
          ? ERROR_MESSAGES.REQUIRED_APPLICATION_ANSWER_MISSING
          : ERROR_MESSAGES.INVALID_APPLICATION_ANSWER,
      );
    }

    return [{ questionId: question.id, questionOptionId: null, content }];
  }

  private validateSingleSelectAnswer(
    question: Question,
    answers: UpsertMyApplicationAnswerCommand[],
  ): ValidatedAnswer[] {
    if (answers.length === 0) {
      return [];
    }
    if (answers.length !== 1) {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_APPLICATION_ANSWER);
    }

    const optionId = answers[0].questionOptionId;
    if (
      !optionId ||
      !question.options?.some((option) => option.id === optionId)
    ) {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_APPLICATION_ANSWER);
    }

    return [
      { questionId: question.id, questionOptionId: optionId, content: null },
    ];
  }

  private validateMultiSelectAnswer(
    question: Question,
    answers: UpsertMyApplicationAnswerCommand[],
  ): ValidatedAnswer[] {
    if (answers.length === 0) {
      return [];
    }

    const optionIds = answers.map((answer) => answer.questionOptionId);
    if (
      optionIds.some((optionId) => !optionId) ||
      new Set(optionIds).size !== optionIds.length
    ) {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_APPLICATION_ANSWER);
    }

    const validOptionIds = new Set(
      (question.options ?? []).map((option) => option.id),
    );
    if (optionIds.some((optionId) => !validOptionIds.has(optionId!))) {
      throw new BadRequestException(ERROR_MESSAGES.INVALID_APPLICATION_ANSWER);
    }

    return optionIds.map((optionId) => ({
      questionId: question.id,
      questionOptionId: optionId!,
      content: null,
    }));
  }
}
