import { Test, TestingModule } from '@nestjs/testing';
import { GetReservationsQuery } from './get-reservations.query';
import {
  REDIS_CLIENT_TOKEN,
  REDIS_KEYS,
} from '@shared/constants/redis.constants';

// ── Mock Redis ──────────────────────────────────────────────────
const mockRedis = {
  zRangeWithScores: jest.fn(),
  hGetAll: jest.fn(),
};

// ── Tests ───────────────────────────────────────────────────────
describe('GetReservationsQuery', () => {
  let query: GetReservationsQuery;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetReservationsQuery,
        { provide: REDIS_CLIENT_TOKEN, useValue: mockRedis },
      ],
    }).compile();

    query = module.get(GetReservationsQuery);
  });

  it('예약 목록을 조회하여 반환해야 한다', async () => {
    mockRedis.zRangeWithScores.mockResolvedValue([
      { value: REDIS_KEYS.PUSH_RESERVATION_MEMBER(1), score: 1000 },
      { value: REDIS_KEYS.PUSH_RESERVATION_MEMBER(2), score: 2000 },
    ]);
    mockRedis.hGetAll
      .mockResolvedValueOnce({
        title: '알림1',
        body: '본문1',
        reserveTime: '2026-06-01T10:00:00.000Z',
        target: JSON.stringify([1]),
      })
      .mockResolvedValueOnce({
        title: '알림2',
        body: '본문2',
        reserveTime: '2026-06-02T10:00:00.000Z',
        target: '',
      });

    const results = await query.execute();

    expect(mockRedis.zRangeWithScores).toHaveBeenCalledWith(
      REDIS_KEYS.PUSH_RESERVATION_ZSET,
      0,
      -1,
    );
    expect(results).toHaveLength(2);
    expect(results[0]).toEqual(
      expect.objectContaining({ id: 1, title: '알림1', target: [1] }),
    );
    expect(results[1]).toEqual(
      expect.objectContaining({ id: 2, title: '알림2', target: undefined }),
    );
  });

  it('예약이 없으면 빈 배열을 반환해야 한다', async () => {
    mockRedis.zRangeWithScores.mockResolvedValue([]);

    const results = await query.execute();

    expect(results).toEqual([]);
    expect(mockRedis.hGetAll).not.toHaveBeenCalled();
  });

  it('데이터가 손상된 항목은 건너뛰어야 한다', async () => {
    mockRedis.zRangeWithScores.mockResolvedValue([
      { value: REDIS_KEYS.PUSH_RESERVATION_MEMBER(1), score: 1000 },
    ]);
    mockRedis.hGetAll.mockResolvedValue({});

    const results = await query.execute();

    expect(results).toEqual([]);
  });
});
