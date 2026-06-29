import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { QuestionService } from '@modules/application/application/services/question.service';
import { Question } from '@modules/application/domain/entities/question.entity';
import { QuestionOption } from '@modules/application/domain/entities/question_option.entity';
import { Survey } from '@modules/application/domain/entities/survey.entity';

import { AnswerType } from '@modules/application/domain/enum/survey.enum';
import { DataSource } from 'typeorm';

describe('QuestionService', () => {
  let service: QuestionService;

  const mockQuestionRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockOptionRepo = {
    find: jest.fn(),
    create: jest.fn((x) => x),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockSurveyRepo = {
    findOne: jest.fn(),
  };

  const queryBuilder = {
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    execute: jest.fn(),
  };

  const mockManager = {
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => queryBuilder),
  };

  const mockDataSource = {
    transaction: jest.fn((callback) => callback(mockManager)),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        QuestionService,
        {
          provide: getRepositoryToken(Question),
          useValue: mockQuestionRepo,
        },
        {
          provide: getRepositoryToken(QuestionOption),
          useValue: mockOptionRepo,
        },
        {
          provide: getRepositoryToken(Survey),
          useValue: mockSurveyRepo,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get(QuestionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // =========================
  // CREATE
  // =========================
  it('createQuestion - should create question with options', async () => {
    mockSurveyRepo.findOne.mockResolvedValue({
      id: 1,
      questions: [],
    });

    mockQuestionRepo.create.mockReturnValue({ id: 1 });
    mockQuestionRepo.save.mockResolvedValue({ id: 1 });

    const dto = {
      surveyId: 1,
      title: '참석 여부',
      answerType: AnswerType.SINGLE_SELECT,
      isRequired: true,
      options: [{ label: '예' }, { label: '아니오' }],
    };

    const result = await service.createQuestion(dto as any);

    expect(result).toEqual({ id: 1 });
    expect(mockSurveyRepo.findOne).toHaveBeenCalled();
    expect(mockQuestionRepo.save).toHaveBeenCalled();
  });

  // =========================
  // UPDATE + syncOptions 포함 테스트
  // =========================
  it('updateQuestion - should update question and sync options', async () => {
    mockQuestionRepo.findOne.mockResolvedValue({
      id: 1,
      answerType: AnswerType.SINGLE_SELECT,
      options: [
        { id: 1, label: 'A', orderNo: 1 },
        { id: 2, label: 'B', orderNo: 2 },
      ],
    });

    mockOptionRepo.find.mockResolvedValue([
      { id: 1, questionId: 1, label: 'A' },
      { id: 2, questionId: 1, label: 'B' },
    ]);

    mockOptionRepo.save.mockResolvedValue([]);
    mockOptionRepo.delete.mockResolvedValue({});

    const dto = {
      questionId: 1,
      title: 'updated',
      isRequired: false,
      options: [
        { id: 1, label: 'A-updated' }, // update
        { label: 'C-new' },            // create
      ],
    };

    await service.updateQuestion(dto as any);

    expect(mockQuestionRepo.save).toHaveBeenCalled();
    expect(mockOptionRepo.save).toHaveBeenCalled();
    expect(mockOptionRepo.delete).toHaveBeenCalled();
  });

  // =========================
  // REORDER
  // =========================
  it('reorderQuestions - should reorder questions', async () => {
    mockManager.find.mockResolvedValue([
      { id: 1, orderNo: 1 },
      { id: 2, orderNo: 2 },
    ]);

    const dto = {
      surveyId: 1,
      questionIds: [2, 1],
    };

    await service.reorderQuestions(dto as any);

    expect(mockManager.createQueryBuilder).toHaveBeenCalled();
  });

  // =========================
  // DELETE
  // =========================
  it('deleteQuestion - should delete question', async () => {
    mockManager.findOne.mockResolvedValue({ id: 1 });

    await service.deleteQuestion(1);

    expect(mockManager.delete).toHaveBeenCalledWith(Question, { id: 1 });
  });

  // =========================
  // VALIDATION RULES
  // =========================
  it('createQuestion - should throw when SUBJECTIVE has options', async () => {
    mockSurveyRepo.findOne.mockResolvedValue({
      id: 1,
      questions: [],
    });

    const dto = {
      surveyId: 1,
      title: 'test',
      answerType: AnswerType.SUBJECTIVE,
      isRequired: true,
      options: [{ label: 'invalid' }],
    };

    await expect(service.createQuestion(dto as any)).rejects.toThrow();
  });

  it('createQuestion - should throw when select type has no options', async () => {
    mockSurveyRepo.findOne.mockResolvedValue({
      id: 1,
      questions: [],
    });

    const dto = {
      surveyId: 1,
      title: 'test',
      answerType: AnswerType.SINGLE_SELECT,
      isRequired: true,
      options: [],
    };

    await expect(service.createQuestion(dto as any)).rejects.toThrow();
  });

  it('createQuestion - should throw on duplicate option labels', async () => {
    mockSurveyRepo.findOne.mockResolvedValue({
      id: 1,
      questions: [],
    });

    const dto = {
      surveyId: 1,
      title: 'test',
      answerType: AnswerType.SINGLE_SELECT,
      isRequired: true,
      options: [
        { label: 'A' },
        { label: 'A' },
      ],
    };

    await expect(service.createQuestion(dto as any)).rejects.toThrow();
  });
});
