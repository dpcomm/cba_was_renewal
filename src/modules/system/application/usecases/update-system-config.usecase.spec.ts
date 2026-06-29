import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Retreat } from '@modules/retreat/domain/entities/retreat.entity';
import { Term } from '@modules/term/domain/entities/term.entity';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';
import { SystemConfig } from '../../domain/entities/system-config.entity';
import { GetSystemConfigQuery } from '../queries/get-system-config.query';
import { UpdateSystemConfigUseCase } from './update-system-config.usecase';

describe('UpdateSystemConfigUseCase', () => {
  let useCase: UpdateSystemConfigUseCase;

  const getSystemConfigQuery = {
    execute: jest.fn(),
  };
  const systemConfigRepository = {
    save: jest.fn(),
  };
  const termRepository = {
    existsBy: jest.fn(),
  };
  const retreatRepository = {
    existsBy: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateSystemConfigUseCase,
        { provide: GetSystemConfigQuery, useValue: getSystemConfigQuery },
        {
          provide: getRepositoryToken(SystemConfig),
          useValue: systemConfigRepository,
        },
        { provide: getRepositoryToken(Term), useValue: termRepository },
        { provide: getRepositoryToken(Retreat), useValue: retreatRepository },
      ],
    }).compile();

    useCase = module.get(UpdateSystemConfigUseCase);
  });

  it('존재하는 수련회와 시즌을 현재 설정으로 선택한다', async () => {
    const config = createSystemConfig();
    const refreshed = createSystemConfig();
    refreshed.currentTermId = 2;
    refreshed.currentRetreatId = 3;
    termRepository.existsBy.mockResolvedValue(true);
    retreatRepository.existsBy.mockResolvedValue(true);
    getSystemConfigQuery.execute
      .mockResolvedValueOnce(config)
      .mockResolvedValueOnce(refreshed);
    systemConfigRepository.save.mockResolvedValue(config);

    await expect(
      useCase.execute({ currentTermId: 2, currentRetreatId: 3 }),
    ).resolves.toBe(refreshed);
    expect(config.currentTermId).toBe(2);
    expect(config.currentRetreatId).toBe(3);
    expect(systemConfigRepository.save).toHaveBeenCalledWith(config);
  });

  it('현재 수련회와 시즌 선택을 null로 해제한다', async () => {
    const config = createSystemConfig();
    config.currentTermId = 2;
    config.currentRetreatId = 3;
    config.privacyPolicyUpdatedAt = new Date('2026-01-01T00:00:00.000Z');
    getSystemConfigQuery.execute.mockResolvedValue(config);
    systemConfigRepository.save.mockResolvedValue(config);

    await useCase.execute({ currentTermId: null, currentRetreatId: null });

    expect(config.currentTermId).toBeNull();
    expect(config.currentRetreatId).toBeNull();
    expect(config.privacyPolicyUpdatedAt).toEqual(
      new Date('2026-01-01T00:00:00.000Z'),
    );
    expect(termRepository.existsBy).not.toHaveBeenCalled();
    expect(retreatRepository.existsBy).not.toHaveBeenCalled();
  });

  it('존재하지 않는 시즌 선택을 거부한다', async () => {
    termRepository.existsBy.mockResolvedValue(false);

    await expect(useCase.execute({ currentTermId: 999 })).rejects.toThrow(
      new BadRequestException(ERROR_MESSAGES.CURRENT_TERM_NOT_FOUND),
    );
    expect(getSystemConfigQuery.execute).not.toHaveBeenCalled();
  });

  it('존재하지 않는 수련회 선택을 거부한다', async () => {
    retreatRepository.existsBy.mockResolvedValue(false);

    await expect(useCase.execute({ currentRetreatId: 999 })).rejects.toThrow(
      new BadRequestException(ERROR_MESSAGES.CURRENT_RETREAT_NOT_FOUND),
    );
    expect(getSystemConfigQuery.execute).not.toHaveBeenCalled();
  });
});

function createSystemConfig(): SystemConfig {
  const config = new SystemConfig();
  Object.assign(config, {
    id: 1,
    currentTermId: null,
    currentRetreatId: null,
  });
  return config;
}
