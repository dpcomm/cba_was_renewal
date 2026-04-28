import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SurveyService } from '@modules/application/application/services/survey.service';
import { Survey } from '@modules/application/domain/entities/survey.entity';
import { SurveyMapper } from '@modules/application/application/mappers/survey.mapper';

describe('SurveyService', () => {
  let service: SurveyService;
  let surveyRepository: Repository<Survey>;

  const mockSurveyRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockMapper = {
    toSurveySummaryList: jest.fn(),
    toSurveySummary: jest.fn(),
    toSurveyResponse: jest.fn(),
    toSurveyPreview: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SurveyService,
        {
          provide: getRepositoryToken(Survey),
          useValue: mockSurveyRepository,
        },
        {
          provide: SurveyMapper,
          useValue: mockMapper,
        },
      ],
    }).compile();

    service = module.get(SurveyService);
    surveyRepository = module.get(getRepositoryToken(Survey));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('getSurveyByRetreat - should return survey list', async () => {
    const surveys = [{ id: 1 }];

    mockSurveyRepository.find.mockResolvedValue(surveys);
    mockMapper.toSurveySummaryList.mockReturnValue(surveys);

    const result = await service.getSurveyByRetreat(100);

    expect(mockSurveyRepository.find).toHaveBeenCalled();
    expect(result).toEqual(surveys);
  });

  it('getSurvey - should return survey detail', async () => {
    const survey = { id: 1, questions: [] };

    mockSurveyRepository.findOne.mockResolvedValue(survey);
    mockMapper.toSurveyResponse.mockReturnValue(survey);

    const result = await service.getSurvey(1);

    expect(result).toEqual(survey);
  });

  it('previewSurvey - should return survey preview', async () => {
    const survey = { id: 1, questions: [] };

    mockSurveyRepository.findOne.mockResolvedValue(survey);
    mockMapper.toSurveyPreview.mockReturnValue(survey);

    const result = await service.previewSurvey(1);

    expect(result).toEqual(survey);
  });

  it('createSurvey - should create survey', async () => {
    const dto = {
      retreatId: 100,
      surveyStartAt: '2026-01-01T00:00:00.000Z',
      surveyEndAt: '2026-01-10T00:00:00.000Z',
    };

    const created = { id: 1 };

    mockSurveyRepository.create.mockReturnValue(created);
    mockSurveyRepository.save.mockResolvedValue(created);
    mockMapper.toSurveySummary.mockReturnValue(created);

    const result = await service.createSurvey(dto as any);

    expect(result).toEqual(created);
  });

  it('deleteSurvey - should delete survey', async () => {
    mockSurveyRepository.findOne.mockResolvedValue({ id: 1 });

    await service.deleteSurvey(1);

    expect(mockSurveyRepository.delete).toHaveBeenCalledWith(1);
  });
});