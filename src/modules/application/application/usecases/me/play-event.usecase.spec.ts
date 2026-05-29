import {
  ConflictException,
  ForbiddenException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PlayEventUseCase } from './play-event.usecase';
import { Application } from '@modules/application/domain/entities/application.entity';
import {
  ApplicationStatus,
  EventResult,
} from '@modules/application/domain/enum/application.enum';

describe('PlayEventUseCase', () => {
  let useCase: PlayEventUseCase;
  let mockManager: {
    findOne: jest.Mock;
    count: jest.Mock;
    update: jest.Mock;
  };

  const dataSource = {
    transaction: jest.fn(),
  };

  beforeEach(() => {
    mockManager = {
      findOne: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    };
    dataSource.transaction.mockImplementation((callback) =>
      callback(mockManager),
    );
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    useCase = new PlayEventUseCase(dataSource as unknown as DataSource);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('신청 row가 없으면 NotFoundException을 던진다', async () => {
    mockManager.findOne.mockResolvedValueOnce(null);

    await expect(useCase.execute('user1', 1)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('체크인 상태가 아니면 ForbiddenException을 던진다', async () => {
    mockManager.findOne.mockResolvedValueOnce({
      status: ApplicationStatus.SUBMITTED,
    });

    await expect(useCase.execute('user1', 1)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('이미 이벤트에 참여했으면 ConflictException을 던진다', async () => {
    mockManager.findOne.mockResolvedValueOnce({
      status: ApplicationStatus.CHECKED_IN,
      eventResult: EventResult.WIN,
    });

    await expect(useCase.execute('user1', 1)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('이벤트 결과를 저장하고 결과를 반환한다', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
    mockManager.findOne
      .mockResolvedValueOnce({
        status: ApplicationStatus.CHECKED_IN,
        eventResult: null,
        eventParticipatedAt: null,
      })
      .mockResolvedValueOnce({ name: 'User1' });
    mockManager.count.mockResolvedValue(0);

    const result = await useCase.execute('user1', 1);

    expect(mockManager.findOne).toHaveBeenCalledWith(Application, {
      where: { userId: 'user1', retreatId: 1 },
      lock: { mode: 'pessimistic_write' },
    });
    expect(mockManager.update).toHaveBeenCalledWith(
      Application,
      { userId: 'user1', retreatId: 1 },
      {
        eventResult: EventResult.LOSE,
        eventParticipatedAt: expect.any(Date),
      },
    );
    expect(result).toEqual({ eventResult: EventResult.LOSE });
  });
});
