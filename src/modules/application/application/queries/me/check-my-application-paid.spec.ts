import { PaymentStatus } from '@modules/application/domain/enum/application.enum';
import { CheckMyApplicationPaidQuery } from './check-my-application-paid.query';
import { NotFoundException } from '@nestjs/common';

describe('CheckMyApplicationPaidQuery', () => {
  let query: CheckMyApplicationPaidQuery;
  const repo = {
    findOne: jest.fn(),
  };

  beforeEach(() => {
    query = new CheckMyApplicationPaidQuery(repo as any);
    jest.clearAllMocks();
  });

  it('결제 상태가 PAID이면 true를 반환한다', async () => {
    repo.findOne.mockResolvedValue({
      paymentStatus: PaymentStatus.PAID,
    });

    await expect(query.execute('user1', 1)).resolves.toBe(true);

    expect(repo.findOne).toHaveBeenCalledWith({
      where: { userId: 'user1', retreatId: 1 },
      select: ['paymentStatus'],
    });
  });

  it('결제 상태가 PAID가 아니면 false를 반환한다', async () => {
    repo.findOne.mockResolvedValue({
      paymentStatus: PaymentStatus.PENDING,
    });

    await expect(query.execute('user1', 1)).resolves.toBe(false);
  });

  it('신청 row가 없으면 NotFoundException을 던진다', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(query.execute('user1', 1)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
