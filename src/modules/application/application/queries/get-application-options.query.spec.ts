import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Retreat } from '@modules/retreat/domain/entities/retreat.entity';
import { RetreatMeal } from '@modules/retreat/domain/entities/retreat_meal.entity';
import { RetreatTransport } from '@modules/retreat/domain/entities/retreat_transport.entity';
import { MealType } from '@modules/retreat/domain/enum/retreat-meal.enum';
import {
  TransportDirection,
  TransportType,
} from '@modules/retreat/domain/enum/retreat-transport.enum';
import { USER_GROUP_OPTIONS } from '@modules/user/domain/enums/user-group.enum';
import { GetApplicationOptionsQuery } from './get-application-options.query';
import { ApplicationOptionRetreatResponseDto } from '@modules/application/presentation/dto/response/application-options.response.dto';

describe('GetApplicationOptionsQuery', () => {
  const retreatRepository = { findOne: jest.fn() };
  const mealRepository = { find: jest.fn() };
  const transportRepository = { find: jest.fn() };
  let query: GetApplicationOptionsQuery;

  beforeEach(() => {
    jest.clearAllMocks();
    query = new GetApplicationOptionsQuery(
      retreatRepository as unknown as Repository<Retreat>,
      mealRepository as unknown as Repository<RetreatMeal>,
      transportRepository as unknown as Repository<RetreatTransport>,
    );
  });

  it('수련회가 없으면 NotFoundException을 던진다', async () => {
    retreatRepository.findOne.mockResolvedValue(null);
    mealRepository.find.mockResolvedValue([]);
    transportRepository.find.mockResolvedValue([]);

    await expect(query.execute(99)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('중그룹, 날짜순 식사, 방향별 교통 옵션을 반환한다', async () => {
    const retreat = {
      id: 4,
      title: '2026 여름 수련회',
      surveys: [],
    } as Retreat;
    const meals = [
      { id: 3, mealDay: '2026-08-15', mealType: MealType.BREAKFAST },
      { id: 2, mealDay: '2026-08-14', mealType: MealType.DINNER },
      { id: 1, mealDay: '2026-08-14', mealType: MealType.BREAKFAST },
    ] as RetreatMeal[];
    const transports = [
      {
        id: 10,
        direction: TransportDirection.DEPARTURE,
        transportType: TransportType.BUS,
      },
      {
        id: 11,
        direction: TransportDirection.RETURN,
        transportType: TransportType.PUBLIC,
      },
    ] as RetreatTransport[];
    retreatRepository.findOne.mockResolvedValue(retreat);
    mealRepository.find.mockResolvedValue(meals);
    transportRepository.find.mockResolvedValue(transports);

    const result = await query.execute(4);

    expect(retreatRepository.findOne).toHaveBeenCalledWith({
      where: { id: 4 },
      relations: ['surveys'],
    });
    expect(mealRepository.find).toHaveBeenCalledWith({
      where: { retreatId: 4 },
      order: { mealDay: 'ASC', id: 'ASC' },
    });
    expect(result.groups).toEqual(USER_GROUP_OPTIONS);
    expect(result.meals.map((meal) => meal.id)).toEqual([1, 2, 3]);
    expect(result.departureTransports).toEqual([transports[0]]);
    expect(result.returnTransports).toEqual([transports[1]]);
  });

  it('신청 화면 수련회 기간은 대표 Survey 기간을 우선 사용한다', () => {
    const retreat = {
      id: 4,
      title: '2026 여름 수련회',
      retreatStartAt: new Date('2026-08-21T00:00:00.000Z'),
      retreatEndAt: new Date('2026-08-23T00:00:00.000Z'),
      surveys: [
        {
          id: 11,
          surveyStartAt: new Date('2026-07-03T00:00:00.000Z'),
          surveyEndAt: new Date('2026-07-06T23:59:59.000Z'),
        },
        {
          id: 10,
          surveyStartAt: new Date('2026-07-02T00:00:00.000Z'),
          surveyEndAt: new Date('2026-07-05T23:59:59.000Z'),
        },
      ],
    } as Retreat;

    const result = new ApplicationOptionRetreatResponseDto(retreat);

    expect(result.startAt.toISOString()).toBe('2026-07-02T00:00:00.000Z');
    expect(result.endAt.toISOString()).toBe('2026-07-05T23:59:59.000Z');
  });

  it('대표 Survey가 없으면 신청 화면 수련회 기간은 수련회 기간으로 fallback한다', () => {
    const retreat = {
      id: 4,
      title: '2026 여름 수련회',
      retreatStartAt: new Date('2026-08-21T00:00:00.000Z'),
      retreatEndAt: new Date('2026-08-23T00:00:00.000Z'),
      surveys: [],
    } as Retreat;

    const result = new ApplicationOptionRetreatResponseDto(retreat);

    expect(result.startAt.toISOString()).toBe('2026-08-21T00:00:00.000Z');
    expect(result.endAt.toISOString()).toBe('2026-08-23T00:00:00.000Z');
  });
});
