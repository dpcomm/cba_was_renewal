import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationService } from './application.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Application } from '@modules/application/domain/entities/application.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationService,
        {
          provide: getRepositoryToken(Application),
          useValue: mockApplicationRepository,
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

});
