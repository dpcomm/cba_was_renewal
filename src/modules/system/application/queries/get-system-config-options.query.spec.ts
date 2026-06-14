import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Retreat } from '@modules/retreat/domain/entities/retreat.entity';
import { Term } from '@modules/term/domain/entities/term.entity';
import { SystemConfig } from '../../domain/entities/system-config.entity';
import { GetSystemConfigQuery } from './get-system-config.query';
import { GetSystemConfigOptionsQuery } from './get-system-config-options.query';

describe('GetSystemConfigOptionsQuery', () => {
  let query: GetSystemConfigOptionsQuery;

  const getSystemConfigQuery = {
    execute: jest.fn(),
  };
  const termRepository = {
    find: jest.fn(),
  };
  const retreatRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetSystemConfigOptionsQuery,
        { provide: GetSystemConfigQuery, useValue: getSystemConfigQuery },
        { provide: getRepositoryToken(Term), useValue: termRepository },
        { provide: getRepositoryToken(Retreat), useValue: retreatRepository },
      ],
    }).compile();

    query = module.get(GetSystemConfigOptionsQuery);
  });

  it('현재 선택값과 수련회 및 시즌 옵션을 반환한다', async () => {
    const config = new SystemConfig();
    config.currentTermId = 2;
    config.currentRetreatId = 4;
    getSystemConfigQuery.execute.mockResolvedValue(config);
    termRepository.find.mockResolvedValue([
      Object.assign(new Term(), { id: 2, name: '2026 봄학기' }),
    ]);
    retreatRepository.find.mockResolvedValue([
      Object.assign(new Retreat(), { id: 4, title: '2026 여름 수련회' }),
    ]);

    await expect(query.execute()).resolves.toEqual({
      currentTermId: 2,
      currentRetreatId: 4,
      terms: [{ id: 2, label: '2026 봄학기' }],
      retreats: [{ id: 4, label: '2026 여름 수련회' }],
    });
    expect(termRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({
        order: { startDate: 'DESC', id: 'DESC' },
      }),
    );
    expect(retreatRepository.find).toHaveBeenCalledWith(
      expect.objectContaining({
        order: { retreatStartAt: 'DESC', id: 'DESC' },
      }),
    );
  });
});
