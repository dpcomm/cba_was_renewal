import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationService } from './application.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Application } from '@modules/application/domain/entities/application.entity';
import { DataSource } from 'typeorm';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
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
    it('should throw NotFoundException if application not found', async () => {
      mockApplicationRepository.findOne.mockResolvedValue(null);

      await expect(service.checkIn('user1', 1, 'admin1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if already checked in', async () => {
      mockApplicationRepository.findOne.mockResolvedValue({
        id: 1,
        checkedInAt: new Date(),
        user: { name: 'TargetUser' },
      });

      await expect(service.checkIn('user1', 1, 'admin1')).rejects.toThrow(
        ConflictException,
      );
    });

    it('should update status and checkedInAt on success', async () => {
      mockApplicationRepository.findOne.mockResolvedValue({
        id: 1,
        checkedInAt: null,
        user: { name: 'TargetUser' },
      });

      const result = await service.checkIn('user1', 1, 'admin1');

      expect(mockApplicationRepository.update).toHaveBeenCalledWith(
        { userId: 'user1', retreatId: 1 },
        expect.objectContaining({
          status: ApplicationStatus.CHECKED_IN,
          checkedInAt: expect.any(Date),
        }),
      );
      expect(result.checkedInAt).toBeDefined();
    });
  });

  describe('playEvent', () => {
    let mockManager: any;

    beforeEach(() => {
      mockManager = {
        findOne: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      };
      mockDataSource.transaction.mockImplementation((cb) => cb(mockManager));
    });

    it('should throw NotFoundException if application not found', async () => {
      mockManager.findOne.mockResolvedValueOnce(null); // application 조회를 null로

      await expect(service.playEvent('user1', 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if not checked in', async () => {
      mockManager.findOne.mockResolvedValueOnce({
        status: ApplicationStatus.SUBMITTED,
      });

      await expect(service.playEvent('user1', 1)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ConflictException if already participated', async () => {
      mockManager.findOne.mockResolvedValueOnce({
        status: ApplicationStatus.CHECKED_IN,
        eventResult: 'WIN', // 이미 참여함
      });

      await expect(service.playEvent('user1', 1)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should update eventResult and eventParticipatedAt on success', async () => {
      mockManager.findOne
        .mockResolvedValueOnce({
          status: ApplicationStatus.CHECKED_IN,
          eventResult: null, // 미참여 상태
        })
        .mockResolvedValueOnce({ name: 'User1' }); // 로그용 User 조회

      mockManager.count.mockResolvedValue(0); // 당첨자 0명 상태

      const result = await service.playEvent('user1', 1);

      expect(mockManager.update).toHaveBeenCalledWith(
        Application,
        { userId: 'user1', retreatId: 1 },
        expect.objectContaining({
          eventResult: expect.any(String), // WIN or LOSE
          eventParticipatedAt: expect.any(Date),
        }),
      );
      expect(result.eventResult).toBeDefined();
    });
  });
});
