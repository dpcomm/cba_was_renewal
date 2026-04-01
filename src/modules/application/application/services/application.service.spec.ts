import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationService } from './application.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Application } from '@modules/application/domain/entities/application.entity';
import { DataSource } from 'typeorm';
import { ConflictException, ForbiddenException } from '@nestjs/common';
import { ApplicationStatus } from '../../domain/enum/application.enum';

describe('ApplicationService', () => {
  let service: ApplicationService;

  const mockApplicationRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(),
    manager: {
      findOne: jest.fn(),
    },
  };

  const mockDataSource = {
    transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationService,
        {
          provide: getRepositoryToken(Application),
          useValue: mockApplicationRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<ApplicationService>(ApplicationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getApplicationDetail', () => {
    it('should query the correct relations including meals, transports, and answers', async () => {
      const mockApp = { id: 1, userId: 'test-user', retreatId: 1 };
      mockApplicationRepository.findOne.mockResolvedValue(mockApp);

      const result = await service.getApplicationDetail('test-user', 1);

      expect(mockApplicationRepository.findOne).toHaveBeenCalledWith({
        where: { userId: 'test-user', retreatId: 1 },
        relations: [
          'applicationMeals',
          'applicationMeals.retreatMeal',
          'applicationTransports',
          'applicationTransports.retreatTransport',
          'answers',
          'answers.question',
          'answers.questionOption',
        ],
      });
      expect(result).toEqual(mockApp);
    });
  });

  describe('checkIn', () => {
    it('should throw ConflictException if already checked in', async () => {
      mockApplicationRepository.findOne.mockResolvedValue({
        checkedInAt: new Date(),
      });

      await expect(service.checkIn('user1', 1, 'admin1')).rejects.toThrow(
        ConflictException,
      );
    });

    it('should update status and checkedInAt on success', async () => {
      mockApplicationRepository.findOne.mockResolvedValue({
        checkedInAt: null,
      });
      mockApplicationRepository.manager.findOne.mockResolvedValue({
        name: 'TargetUser',
      });

      const result = await service.checkIn('user1', 1, 'admin1');

      expect(mockApplicationRepository.update).toHaveBeenCalledWith(
        { userId: 'user1', retreatId: 1 },
        expect.objectContaining({
          status: ApplicationStatus.CHECKED_IN,
        }),
      );
      expect(result.checkedInAt).toBeDefined();
    });
  });

  describe('playEvent', () => {
    it('should throw ForbiddenException if not checked in', async () => {
      const mockManager = {
        findOne: jest.fn().mockResolvedValue({
          status: ApplicationStatus.SUBMITTED,
        }),
      };
      mockDataSource.transaction.mockImplementation((cb) => cb(mockManager));

      await expect(service.playEvent('user1', 1)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should update eventResult and eventParticipatedAt on success', async () => {
      const mockApp = {
        status: ApplicationStatus.CHECKED_IN,
        eventResult: null,
      };
      const mockManager = {
        findOne: jest.fn().mockResolvedValue(mockApp),
        count: jest.fn().mockResolvedValue(0),
        update: jest.fn(),
      };
      mockDataSource.transaction.mockImplementation((cb) => cb(mockManager));

      const result = await service.playEvent('user1', 1);

      expect(mockManager.update).toHaveBeenCalledWith(
        Application,
        { userId: 'user1', retreatId: 1 },
        expect.objectContaining({
          eventParticipatedAt: expect.any(Date),
        }),
      );
      expect(result.eventResult).toBeDefined();
    });
  });
});
