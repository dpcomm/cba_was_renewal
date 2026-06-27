import { ConflictException, NotFoundException } from '@nestjs/common';
import { DataSource, Not } from 'typeorm';
import { Application } from '@modules/application/domain/entities/application.entity';
import { ApplicationStatus } from '@modules/application/domain/enum/application.enum';
import { DeleteMyApplicationUseCase } from './delete-my-application.usecase';

describe('DeleteMyApplicationUseCase', () => {
  const manager = {
    findOne: jest.fn(),
    save: jest.fn(),
  };
  const dataSource = {
    transaction: jest.fn((callback) => callback(manager)),
  };
  let useCase: DeleteMyApplicationUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new DeleteMyApplicationUseCase(
      dataSource as unknown as DataSource,
    );
  });

  it('내 신청을 CANCELED 상태로 소프트 삭제한다', async () => {
    const application = {
      id: 7,
      userId: 'user1',
      retreatId: 4,
      status: ApplicationStatus.SUBMITTED,
      checkedInAt: null,
    };
    manager.findOne.mockResolvedValue(application);
    manager.save.mockImplementation((_, entity) => entity);

    const result = await useCase.execute('user1', 4);

    expect(result).toEqual({
      applicationId: 7,
      retreatId: 4,
      status: ApplicationStatus.CANCELED,
      canceled: true,
    });
    expect(manager.findOne).toHaveBeenCalledWith(Application, {
      where: {
        userId: 'user1',
        retreatId: 4,
        status: Not(ApplicationStatus.CANCELED),
      },
      lock: { mode: 'pessimistic_write' },
    });
    expect(manager.save).toHaveBeenCalledWith(Application, {
      ...application,
      status: ApplicationStatus.CANCELED,
      checkedInAt: null,
    });
  });

  it('신청이 없으면 NotFoundException을 던진다', async () => {
    manager.findOne.mockResolvedValue(null);

    await expect(useCase.execute('user1', 4)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('체크인된 신청은 삭제할 수 없다', async () => {
    manager.findOne.mockResolvedValue({
      id: 7,
      userId: 'user1',
      retreatId: 4,
      status: ApplicationStatus.CHECKED_IN,
    });

    await expect(useCase.execute('user1', 4)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(manager.save).not.toHaveBeenCalled();
  });
});
