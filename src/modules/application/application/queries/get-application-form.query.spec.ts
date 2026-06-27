import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Application } from '@modules/application/domain/entities/application.entity';
import { Survey } from '@modules/application/domain/entities/survey.entity';
import { Retreat } from '@modules/retreat/domain/entities/retreat.entity';
import { RetreatMeal } from '@modules/retreat/domain/entities/retreat_meal.entity';
import { RetreatTransport } from '@modules/retreat/domain/entities/retreat_transport.entity';
import { TransportDirection } from '@modules/retreat/domain/enum/retreat-transport.enum';
import { SystemConfig } from '@modules/system/domain/entities/system-config.entity';
import { User } from '@modules/user/domain/entities/user.entity';
import { UserGroup } from '@modules/user/domain/enums/user-group.enum';
import { GetApplicationFormQuery } from './get-application-form.query';
import { ApplicationStatus } from '@modules/application/domain/enum/application.enum';
import { Not } from 'typeorm';

describe('GetApplicationFormQuery', () => {
  const systemConfigRepository = { findOneBy: jest.fn() };
  const retreatRepository = { findOneBy: jest.fn() };
  const surveyRepository = { findOne: jest.fn() };
  const mealRepository = { find: jest.fn() };
  const transportRepository = { find: jest.fn() };
  const applicationRepository = { findOne: jest.fn() };
  const userRepository = { findOneBy: jest.fn() };
  let query: GetApplicationFormQuery;

  beforeEach(() => {
    jest.clearAllMocks();
    query = new GetApplicationFormQuery(
      systemConfigRepository as unknown as Repository<SystemConfig>,
      retreatRepository as unknown as Repository<Retreat>,
      surveyRepository as unknown as Repository<Survey>,
      mealRepository as unknown as Repository<RetreatMeal>,
      transportRepository as unknown as Repository<RetreatTransport>,
      applicationRepository as unknown as Repository<Application>,
      userRepository as unknown as Repository<User>,
    );
  });

  it('현재 수련회 기준 신청 양식을 조회한다', async () => {
    systemConfigRepository.findOneBy.mockResolvedValue({ currentRetreatId: 4 });
    userRepository.findOneBy.mockResolvedValue(createUser());
    retreatRepository.findOneBy.mockResolvedValue({ id: 4 } as Retreat);
    surveyRepository.findOne.mockResolvedValue({ id: 10, retreatId: 4 });
    mealRepository.find.mockResolvedValue([]);
    transportRepository.find.mockResolvedValue([
      { id: 1, direction: TransportDirection.DEPARTURE },
      { id: 2, direction: TransportDirection.RETURN },
    ]);
    applicationRepository.findOne.mockResolvedValue(null);

    const result = await query.execute('user1');

    expect(systemConfigRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(userRepository.findOneBy).toHaveBeenCalledWith({ userId: 'user1' });
    expect(surveyRepository.findOne).toHaveBeenCalledWith({
      where: { retreatId: 4 },
      relations: ['questions', 'questions.options'],
      order: { id: 'ASC' },
    });
    expect(applicationRepository.findOne).toHaveBeenCalledWith({
      where: {
        userId: 'user1',
        retreatId: 4,
        status: Not(ApplicationStatus.CANCELED),
      },
      relations: ['applicationMeals', 'applicationTransports', 'answers'],
    });
    expect(result.currentGroup).toBe(
      UserGroup.KWON_SOON_YOUNG_AND_LIM_KANG_MI_M,
    );
    expect(result.departureTransports.map((transport) => transport.id)).toEqual(
      [1],
    );
    expect(result.returnTransports.map((transport) => transport.id)).toEqual([
      2,
    ]);
  });

  it('현재 수련회가 설정되지 않았으면 NotFoundException을 던진다', async () => {
    systemConfigRepository.findOneBy.mockResolvedValue({
      currentRetreatId: null,
    });

    await expect(query.execute('user1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('유저가 없으면 NotFoundException을 던진다', async () => {
    userRepository.findOneBy.mockResolvedValue(null);
    retreatRepository.findOneBy.mockResolvedValue({ id: 4 } as Retreat);
    surveyRepository.findOne.mockResolvedValue({ id: 10, retreatId: 4 });
    mealRepository.find.mockResolvedValue([]);
    transportRepository.find.mockResolvedValue([]);
    applicationRepository.findOne.mockResolvedValue(null);

    await expect(query.execute('missing-user', 4)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('신청서가 없으면 NotFoundException을 던진다', async () => {
    userRepository.findOneBy.mockResolvedValue(createUser());
    retreatRepository.findOneBy.mockResolvedValue({ id: 4 } as Retreat);
    surveyRepository.findOne.mockResolvedValue(null);
    mealRepository.find.mockResolvedValue([]);
    transportRepository.find.mockResolvedValue([]);
    applicationRepository.findOne.mockResolvedValue(null);

    await expect(query.execute('user1', 4)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});

function createUser(): User {
  return Object.assign(new User(), {
    userId: 'user1',
    group: UserGroup.KWON_SOON_YOUNG_AND_LIM_KANG_MI_M,
  });
}
