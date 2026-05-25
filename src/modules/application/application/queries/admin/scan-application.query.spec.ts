import { Logger, NotFoundException } from '@nestjs/common';
import { ScanApplicationQuery } from './scan-application.query';
import {
  ApplicationStatus,
  PaymentStatus,
} from '@modules/application/domain/enum/application.enum';

describe('ScanApplicationQuery', () => {
  let query: ScanApplicationQuery;
  const repository = {
    findOne: jest.fn(),
  };

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    query = new ScanApplicationQuery(repository as any);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('QR 스캔용 신청자 정보를 조회한다', async () => {
    const checkedInAt = new Date('2026-04-20T09:15:00.000Z');
    repository.findOne.mockResolvedValue({
      userId: 'anna_choi',
      paymentStatus: PaymentStatus.PAID,
      status: ApplicationStatus.CHECKED_IN,
      checkedInAt,
      user: {
        name: '최슬기',
        phone: '010-5564-6658',
        group: '대청 2부',
      },
    });

    const result = await query.execute('anna_choi', 1);

    expect(repository.findOne).toHaveBeenCalledWith({
      where: { userId: 'anna_choi', retreatId: 1 },
      relations: ['user'],
      select: {
        id: true,
        userId: true,
        paymentStatus: true,
        status: true,
        checkedInAt: true,
        user: {
          name: true,
          phone: true,
          group: true,
        },
      },
    });
    expect(result).toEqual({
      userId: 'anna_choi',
      name: '최슬기',
      phone: '010-5564-6658',
      group: '대청 2부',
      paymentStatus: PaymentStatus.PAID,
      status: ApplicationStatus.CHECKED_IN,
      checkedInAt,
    });
  });

  it('신청 row가 없으면 NotFoundException을 던진다', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(query.execute('missing_user', 1)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
