import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Retreat } from '@modules/retreat/domain/entities/retreat.entity';
import { Survey } from '@modules/application/domain/entities/survey.entity';
import { RetreatService } from './retreat.service';

describe('RetreatService', () => {
  let retreatRepository: jest.Mocked<Partial<Repository<Retreat>>>;
  let dataSource: jest.Mocked<Partial<DataSource>>;
  let service: RetreatService;

  beforeEach(() => {
    retreatRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };
    dataSource = {
      transaction: jest.fn(),
    };

    service = new RetreatService(
      retreatRepository as Repository<Retreat>,
      dataSource as DataSource,
    );
  });

  it('creates a retreat and default survey in one transaction', async () => {
    const manager = createTransactionManager();
    dataSource.transaction!.mockImplementation((callback) => callback(manager));

    const result = await service.createRetreat({
      title: '2026 여름 수련회',
      location: '수련원',
      address: '경기도 안산시',
      retreatStartAt: '2026-08-21T00:00:00.000Z',
      retreatEndAt: '2026-08-23T00:00:00.000Z',
      surveyStartAt: '2026-07-02T00:00:00.000Z',
      surveyEndAt: '2026-07-05T23:59:59.000Z',
    });

    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    expect(manager.save).toHaveBeenCalledWith(
      Retreat,
      expect.objectContaining({
        title: '2026 여름 수련회',
        location: '수련원',
        address: '경기도 안산시',
      }),
    );
    expect(manager.save).toHaveBeenCalledWith(
      Survey,
      expect.objectContaining({
        retreatId: 1,
        title: '2026 여름 수련회 신청서',
      }),
    );
    expect(result.surveys).toHaveLength(1);
    expect(result.surveys[0].surveyStartAt.toISOString()).toBe(
      '2026-07-02T00:00:00.000Z',
    );
  });

  it('updates retreat fields and representative survey period', async () => {
    const retreat = createRetreat();
    retreatRepository.findOne!.mockResolvedValue(retreat);
    const manager = createTransactionManager();
    dataSource.transaction!.mockImplementation((callback) => callback(manager));

    const result = await service.updateRetreat({
      id: 1,
      title: '2026 여름 수련회 수정',
      surveyStartAt: '2026-07-03T00:00:00.000Z',
      surveyEndAt: '2026-07-06T23:59:59.000Z',
    });

    expect(manager.save).toHaveBeenCalledWith(
      Retreat,
      expect.objectContaining({ title: '2026 여름 수련회 수정' }),
    );
    expect(manager.save).toHaveBeenCalledWith(
      Survey,
      expect.objectContaining({
        id: 10,
        title: '2026 여름 수련회 수정 신청서',
        surveyStartAt: new Date('2026-07-03T00:00:00.000Z'),
        surveyEndAt: new Date('2026-07-06T23:59:59.000Z'),
      }),
    );
    expect(result.surveys[0].id).toBe(10);
  });

  it('updates representative survey title when retreat title changes', async () => {
    const retreat = createRetreat();
    retreatRepository.findOne!.mockResolvedValue(retreat);
    const manager = createTransactionManager();
    dataSource.transaction!.mockImplementation((callback) => callback(manager));

    await service.updateRetreat({
      id: 1,
      title: '2026 겨울 수련회',
    });

    expect(manager.save).toHaveBeenCalledWith(
      Survey,
      expect.objectContaining({
        id: 10,
        title: '2026 겨울 수련회 신청서',
      }),
    );
  });

  it('rejects invalid retreat period', async () => {
    await expect(
      service.createRetreat({
        title: '2026 여름 수련회',
        location: '수련원',
        address: '경기도 안산시',
        retreatStartAt: '2026-08-23T00:00:00.000Z',
        retreatEndAt: '2026-08-21T00:00:00.000Z',
        surveyStartAt: '2026-07-02T00:00:00.000Z',
        surveyEndAt: '2026-07-05T23:59:59.000Z',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws not found when retreat does not exist', async () => {
    retreatRepository.findOne!.mockResolvedValue(null);

    await expect(service.updateRetreat({ id: 999 })).rejects.toThrow(
      NotFoundException,
    );
  });
});

function createTransactionManager() {
  return {
    create: jest.fn((entity, data) => Object.assign(new entity(), data)),
    save: jest.fn((entity, data) => {
      if (entity === Retreat) {
        return Promise.resolve(
          Object.assign(data, {
            id: data.id ?? 1,
            createdAt: data.createdAt ?? new Date('2026-01-01T00:00:00.000Z'),
            updatedAt: data.updatedAt ?? new Date('2026-01-01T00:00:00.000Z'),
          }),
        );
      }

      return Promise.resolve(
        Object.assign(data, {
          id: data.id ?? 10,
          createdAt: data.createdAt ?? new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: data.updatedAt ?? new Date('2026-01-01T00:00:00.000Z'),
        }),
      );
    }),
  };
}

function createRetreat(): Retreat {
  const retreat = Object.assign(new Retreat(), {
    id: 1,
    title: '2026 여름 수련회',
    location: '수련원',
    address: '경기도 안산시',
    retreatStartAt: new Date('2026-08-21T00:00:00.000Z'),
    retreatEndAt: new Date('2026-08-23T00:00:00.000Z'),
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  });

  retreat.surveys = [
    Object.assign(new Survey(), {
      id: 10,
      retreatId: 1,
      title: '2026 여름 수련회 신청서',
      surveyStartAt: new Date('2026-07-02T00:00:00.000Z'),
      surveyEndAt: new Date('2026-07-05T23:59:59.000Z'),
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    }),
  ];

  return retreat;
}
