import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Answer } from '@modules/application/domain/entities/answer.entity';
import { Application } from '@modules/application/domain/entities/application.entity';
import { ApplicationMeal } from '@modules/application/domain/entities/application_meal.entity';
import { ApplicationTransport } from '@modules/application/domain/entities/application_transport.entity';
import { Question } from '@modules/application/domain/entities/question.entity';
import { QuestionOption } from '@modules/application/domain/entities/question_option.entity';
import { Survey } from '@modules/application/domain/entities/survey.entity';
import { ApplicationStatus } from '@modules/application/domain/enum/application.enum';
import { AnswerType } from '@modules/application/domain/enum/survey.enum';
import { Retreat } from '@modules/retreat/domain/entities/retreat.entity';
import { RetreatMeal } from '@modules/retreat/domain/entities/retreat_meal.entity';
import { RetreatTransport } from '@modules/retreat/domain/entities/retreat_transport.entity';
import {
  TransportDirection,
  TransportType,
} from '@modules/retreat/domain/enum/retreat-transport.enum';
import { User } from '@modules/user/domain/entities/user.entity';
import { UserGroup } from '@modules/user/domain/enums/user-group.enum';
import { UpsertMyApplicationUseCase } from './upsert-my-application.usecase';

describe('UpsertMyApplicationUseCase', () => {
  const manager = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn((_entity, value) => value),
    save: jest.fn((_entity, value) =>
      Promise.resolve(
        Array.isArray(value) ? value : { id: value.id ?? 100, ...value },
      ),
    ),
    delete: jest.fn(),
  };
  const dataSource = {
    transaction: jest.fn((callback) => callback(manager)),
  };
  let useCase: UpsertMyApplicationUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new UpsertMyApplicationUseCase(
      dataSource as unknown as DataSource,
    );
  });

  it('신청이 없으면 Application과 선택 데이터를 생성한다', async () => {
    mockBaseEntities(null);
    manager.find.mockImplementation((entity) => {
      if (entity === RetreatMeal) return Promise.resolve([createMeal(1)]);
      if (entity === RetreatTransport)
        return Promise.resolve([
          createTransport(5, TransportDirection.DEPARTURE),
        ]);
      return Promise.resolve([]);
    });

    const result = await useCase.execute('user1', 4, {
      group: UserGroup.BAE_YOON_HEE_AND_KIM_JUN_YOUNG_M,
      surveyId: 10,
      retreatMealIds: [1],
      transports: [{ retreatTransportId: 5 }],
      answers: [
        { questionId: 1, questionOptionId: 11 },
        { questionId: 2, content: '기도 제목' },
      ],
    });

    expect(result).toEqual({
      applicationId: 100,
      retreatId: 4,
      surveyId: 10,
      status: ApplicationStatus.SUBMITTED,
    });
    expect(manager.save).toHaveBeenCalledWith(
      User,
      expect.objectContaining({
        group: UserGroup.BAE_YOON_HEE_AND_KIM_JUN_YOUNG_M,
      }),
    );
    expect(manager.save).toHaveBeenCalledWith(ApplicationMeal, [
      expect.objectContaining({ applicationId: 100, retreatMealId: 1 }),
    ]);
    expect(manager.save).toHaveBeenCalledWith(ApplicationTransport, [
      expect.objectContaining({
        applicationId: 100,
        retreatTransportId: 5,
        direction: TransportDirection.DEPARTURE,
      }),
    ]);
    expect(manager.save).toHaveBeenCalledWith(
      Answer,
      expect.arrayContaining([
        expect.objectContaining({
          applicationId: 100,
          questionId: 1,
          questionOptionId: 11,
        }),
        expect.objectContaining({
          applicationId: 100,
          questionId: 2,
          content: '기도 제목',
        }),
      ]),
    );
  });

  it('기존 취소 신청은 SUBMITTED로 복구해 수정한다', async () => {
    mockBaseEntities(
      Object.assign(new Application(), {
        id: 7,
        userId: 'user1',
        retreatId: 4,
        surveyId: 10,
        status: ApplicationStatus.CANCELED,
        checkedInAt: null,
      }),
    );
    manager.find.mockResolvedValue([]);

    const result = await useCase.execute('user1', 4, {
      group: UserGroup.KWON_SOON_YOUNG_AND_LIM_KANG_MI_M,
      surveyId: 10,
      answers: [
        { questionId: 1, questionOptionId: 11 },
        { questionId: 2, content: '다시 신청' },
      ],
    });

    expect(result.applicationId).toBe(7);
    expect(result.status).toBe(ApplicationStatus.SUBMITTED);
  });

  it('체크인된 신청은 사용자 수정을 거부한다', async () => {
    mockBaseEntities(
      Object.assign(new Application(), {
        id: 7,
        status: ApplicationStatus.CHECKED_IN,
      }),
    );

    await expect(
      useCase.execute('user1', 4, {
        group: UserGroup.KWON_SOON_YOUNG_AND_LIM_KANG_MI_M,
        surveyId: 10,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('신청 기간 밖이면 거부한다', async () => {
    mockBaseEntities(null, {
      surveyStartAt: new Date('2025-01-01T00:00:00.000Z'),
      surveyEndAt: new Date('2025-01-02T00:00:00.000Z'),
    });

    await expect(
      useCase.execute('user1', 4, {
        group: UserGroup.KWON_SOON_YOUNG_AND_LIM_KANG_MI_M,
        surveyId: 10,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('필수 답변 누락을 거부한다', async () => {
    mockBaseEntities(null);
    manager.find.mockResolvedValue([]);

    await expect(
      useCase.execute('user1', 4, {
        group: UserGroup.KWON_SOON_YOUNG_AND_LIM_KANG_MI_M,
        surveyId: 10,
        answers: [{ questionId: 1, questionOptionId: 11 }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('다른 수련회의 survey를 거부한다', async () => {
    mockBaseEntities(null, { retreatId: 99 });

    await expect(
      useCase.execute('user1', 4, {
        group: UserGroup.KWON_SOON_YOUNG_AND_LIM_KANG_MI_M,
        surveyId: 10,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  function mockBaseEntities(
    application: Application | null,
    surveyOverrides: Partial<Survey> = {},
  ) {
    manager.findOne.mockImplementation((entity) => {
      if (entity === User) return Promise.resolve(createUser());
      if (entity === Retreat) return Promise.resolve({ id: 4 } as Retreat);
      if (entity === Survey)
        return Promise.resolve(createSurvey(surveyOverrides));
      if (entity === Application) return Promise.resolve(application);
      return Promise.resolve(null);
    });
  }
});

function createUser(): User {
  return Object.assign(new User(), {
    userId: 'user1',
    group: UserGroup.KWON_SOON_YOUNG_AND_LIM_KANG_MI_M,
  });
}

function createSurvey(overrides: Partial<Survey> = {}): Survey {
  return Object.assign(new Survey(), {
    id: 10,
    retreatId: 4,
    surveyStartAt: new Date('2026-01-01T00:00:00.000Z'),
    surveyEndAt: new Date('2027-01-01T00:00:00.000Z'),
    questions: [
      createQuestion(1, AnswerType.SINGLE_SELECT, true, [createOption(11, 1)]),
      createQuestion(2, AnswerType.SUBJECTIVE, true, []),
    ],
    ...overrides,
  });
}

function createQuestion(
  id: number,
  answerType: AnswerType,
  isRequired: boolean,
  options: QuestionOption[],
): Question {
  return Object.assign(new Question(), {
    id,
    answerType,
    isRequired,
    options,
  });
}

function createOption(id: number, questionId: number): QuestionOption {
  return Object.assign(new QuestionOption(), { id, questionId });
}

function createMeal(id: number): RetreatMeal {
  return Object.assign(new RetreatMeal(), { id, retreatId: 4 });
}

function createTransport(
  id: number,
  direction: TransportDirection,
): RetreatTransport {
  return Object.assign(new RetreatTransport(), {
    id,
    retreatId: 4,
    direction,
    transportType: TransportType.BUS,
    isVehicleRequired: false,
    isRemarkRequired: false,
  });
}
