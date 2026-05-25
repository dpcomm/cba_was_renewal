import {
  ApplicationStatus,
  PaymentStatus,
} from '@modules/application/domain/enum/application.enum';
import { UserGroup } from '@modules/user/domain/enums/user-group.enum';
import { GetAdminApplicationListQuery } from './get-admin-application-list.query';

describe('GetAdminApplicationListQuery', () => {
  let query: GetAdminApplicationListQuery;
  let queryBuilder: {
    leftJoinAndSelect: jest.Mock;
    where: jest.Mock;
    orderBy: jest.Mock;
    andWhere: jest.Mock;
    select: jest.Mock;
    skip: jest.Mock;
    take: jest.Mock;
    getManyAndCount: jest.Mock;
  };

  const repository = {
    createQueryBuilder: jest.fn(),
  };

  beforeEach(() => {
    queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    };
    repository.createQueryBuilder.mockReturnValue(queryBuilder);
    query = new GetAdminApplicationListQuery(repository as any);
    jest.clearAllMocks();
  });

  it('관리자 신청자 목록을 조회하고 응답 형태로 매핑한다', async () => {
    const checkedInAt = new Date('2026-04-20T09:15:00.000Z');
    queryBuilder.getManyAndCount.mockResolvedValue([
      [
        {
          userId: 'anna_choi',
          paymentStatus: PaymentStatus.PAID,
          status: ApplicationStatus.CHECKED_IN,
          checkedInAt,
          eventResult: null,
          user: {
            name: '최슬기',
            phone: '010-5564-6658',
            group: UserGroup.BRIDGE,
          },
        },
      ],
      1,
    ]);

    const result = await query.execute({ retreatId: 1, page: 2, limit: 10 });

    expect(repository.createQueryBuilder).toHaveBeenCalledWith('app');
    expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
      'app.user',
      'user',
    );
    expect(queryBuilder.where).toHaveBeenCalledWith(
      'app.retreatId = :retreatId',
      { retreatId: 1 },
    );
    expect(queryBuilder.orderBy).toHaveBeenCalledWith('user.name', 'ASC');
    expect(queryBuilder.select).toHaveBeenCalledWith([
      'app.userId',
      'user.name',
      'user.phone',
      'user.group',
      'app.paymentStatus',
      'app.status',
      'app.checkedInAt',
      'app.eventResult',
    ]);
    expect(queryBuilder.skip).toHaveBeenCalledWith(10);
    expect(queryBuilder.take).toHaveBeenCalledWith(10);
    expect(result).toEqual({
      items: [
        {
          userId: 'anna_choi',
          name: '최슬기',
          phone: '010-5564-6658',
          group: UserGroup.BRIDGE,
          paymentStatus: PaymentStatus.PAID,
          status: ApplicationStatus.CHECKED_IN,
          checkedInAt,
          eventResult: null,
        },
      ],
      meta: {
        page: 2,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: true,
      },
    });
  });

  it('검색어와 결제/체크인/그룹 필터가 있으면 조건을 추가한다', async () => {
    queryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

    await query.execute({
      retreatId: 1,
      search: '최슬기',
      paymentStatus: PaymentStatus.PAID,
      applicationStatus: ApplicationStatus.CHECKED_IN,
      group: UserGroup.BRIDGE,
      page: 1,
      limit: 20,
    });

    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      '(user.name LIKE :search OR user.userId LIKE :search OR user.group LIKE :search)',
      { search: '%최슬기%' },
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'app.paymentStatus = :paymentStatus',
      { paymentStatus: PaymentStatus.PAID },
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'app.status = :applicationStatus',
      { applicationStatus: ApplicationStatus.CHECKED_IN },
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith('user.group = :group', {
      group: UserGroup.BRIDGE,
    });
  });
});
