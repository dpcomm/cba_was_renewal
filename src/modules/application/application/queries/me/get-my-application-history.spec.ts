import { GetMyApplicationHistoryQuery } from './get-my-application-history.query';
import { ApplicationStatus } from '@modules/application/domain/enum/application.enum';
import { Not, Repository } from 'typeorm';
import { Application } from '@modules/application/domain/entities/application.entity';

describe('GetMyApplicationHistoryQuery', () => {
  let query: GetMyApplicationHistoryQuery;
  const repo = {
    find: jest.fn(),
  };

  beforeEach(() => {
    query = new GetMyApplicationHistoryQuery(
      repo as unknown as Repository<Application>,
    );
    jest.clearAllMocks();
  });

  it('신청한 수련회 ID 목록을 생성일 오름차순 조회 결과로 반환한다', async () => {
    repo.find.mockResolvedValue([{ retreatId: 1 }, { retreatId: 3 }]);

    await expect(query.execute('user1')).resolves.toEqual([1, 3]);

    expect(repo.find).toHaveBeenCalledWith({
      where: { userId: 'user1', status: Not(ApplicationStatus.CANCELED) },
      select: ['retreatId'],
      order: { createdAt: 'ASC' },
    });
  });

  it('신청 내역이 없으면 빈 배열을 반환한다', async () => {
    repo.find.mockResolvedValue([]);

    await expect(query.execute('user1')).resolves.toEqual([]);
  });
});
