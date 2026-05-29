import { ConflictException, Logger, NotFoundException } from '@nestjs/common';
import { CheckInApplicationUseCase } from './check-in-application.usecase';
import { ApplicationStatus } from '@modules/application/domain/enum/application.enum';

describe('CheckInApplicationUseCase', () => {
  let useCase: CheckInApplicationUseCase;
  const repository = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    useCase = new CheckInApplicationUseCase(repository as any);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('신청 row가 없으면 NotFoundException을 던진다', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(useCase.execute('user1', 1, 'admin1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('이미 체크인된 신청이면 ConflictException을 던진다', async () => {
    repository.findOne.mockResolvedValue({
      checkedInAt: new Date(),
      user: { name: '최슬기' },
    });

    await expect(useCase.execute('user1', 1, 'admin1')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('체크인 상태와 체크인 시간을 저장한다', async () => {
    repository.findOne.mockResolvedValue({
      id: 1,
      checkedInAt: null,
      user: { name: '최슬기' },
    });

    const result = await useCase.execute('user1', 1, 'admin1');

    expect(repository.findOne).toHaveBeenCalledWith({
      where: { userId: 'user1', retreatId: 1 },
      relations: ['user'],
      select: {
        id: true,
        checkedInAt: true,
        user: {
          name: true,
        },
      },
    });
    expect(repository.update).toHaveBeenCalledWith(
      { userId: 'user1', retreatId: 1 },
      {
        checkedInAt: expect.any(Date),
        status: ApplicationStatus.CHECKED_IN,
      },
    );
    expect(result.checkedInAt).toBeInstanceOf(Date);
  });
});
