import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Application } from '@modules/application/domain/entities/application.entity';
import { Retreat } from '@modules/retreat/domain/entities/retreat.entity';
import { User } from '@modules/user/domain/entities/user.entity';
import { MealType } from '@modules/retreat/domain/enum/retreat-meal.enum';

describe('DashboardService', () => {
  let service: DashboardService;

  const mockApplicationRepository = {
    count: jest.fn(),
    manager: {
      createQueryBuilder: jest.fn().mockReturnValue({
        innerJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        addGroupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn(),
      }),
    },
    createQueryBuilder: jest.fn().mockReturnValue({
      innerJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      setParameters: jest.fn().mockReturnThis(),
      getRawMany: jest.fn(),
    }),
  };

  const mockRetreatRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockUserRepository = {
    count: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn(),
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: getRepositoryToken(Application),
          useValue: mockApplicationRepository,
        },
        {
          provide: getRepositoryToken(Retreat),
          useValue: mockRetreatRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSummary', () => {
    it('should calculate meal stats from ApplicationMeal relations', async () => {
      mockUserRepository.count.mockResolvedValue(100);
      mockRetreatRepository.find.mockResolvedValue([{ id: 1 }]);
      mockRetreatRepository.findOne.mockResolvedValue({
        id: 1,
        retreatStartAt: new Date('2025-08-14T00:00:00Z'),
      });
      mockApplicationRepository.count.mockResolvedValue(50);

      const mockMealRaw = [
        {
          mealDay: '2025-08-14T00:00:00Z', // dayIdx = 0 (Day 1)
          mealType: MealType.DINNER,
          count: '10',
        },
        {
          mealDay: '2025-08-15T00:00:00Z', // dayIdx = 1 (Day 2)
          mealType: MealType.LUNCH,
          count: '20',
        },
      ];
      mockApplicationRepository.manager
        .createQueryBuilder()
        .getRawMany.mockResolvedValue(mockMealRaw);

      const result = await service.getSummary(1);

      expect(result.appliedCount).toBe(50);
      expect(result.mealStats[0][2]).toBe(10); // Day 1 Dinner
      expect(result.mealStats[1][1]).toBe(20); // Day 2 Lunch
    });
  });

  describe('getGroupStats', () => {
    it('should aggregate counts by group', async () => {
      mockRetreatRepository.find.mockResolvedValue([{ id: 1 }]);
      mockUserRepository
        .createQueryBuilder()
        .getRawMany.mockResolvedValue([{ group: '새친구', totalCount: '10' }]);
      mockApplicationRepository
        .createQueryBuilder()
        .getRawMany.mockResolvedValue([
          {
            group: '새친구',
            appliedCount: '5',
            paidCount: '3',
            checkedInCount: '2',
          },
        ]);

      const result = await service.getGroupStats(1);

      expect(result).toHaveLength(1);
      expect(result[0].group).toBe('새친구');
      expect(result[0].appliedCount).toBe(5);
    });
  });
});
