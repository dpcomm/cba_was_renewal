import { Test, TestingModule } from '@nestjs/testing';
import { ReservePushUseCase } from './reserve-push.usecase';
import {
  REDIS_CLIENT_TOKEN,
  REDIS_KEYS,
} from '@shared/constants/redis.constants';

// ── Mock Redis ──────────────────────────────────────────────────
const mockMulti = {
  hSet: jest.fn().mockReturnThis(),
  zAdd: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue([]),
};

const mockRedis = {
  incr: jest.fn().mockResolvedValue(42),
  multi: jest.fn().mockReturnValue(mockMulti),
};

// ── Tests ───────────────────────────────────────────────────────
describe('ReservePushUseCase', () => {
  let useCase: ReservePushUseCase;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservePushUseCase,
        { provide: REDIS_CLIENT_TOKEN, useValue: mockRedis },
      ],
    }).compile();

    useCase = module.get(ReservePushUseCase);
  });

  it('Redis에 예약 데이터를 저장하고 결과를 반환해야 한다', async () => {
    const dto = {
      title: '예약 푸시',
      body: '본문',
      reserveTime: '2026-06-01T10:00:00.000Z',
      target: [1, 2],
    };

    const result = await useCase.execute(dto);

    expect(mockRedis.incr).toHaveBeenCalledWith(
      REDIS_KEYS.PUSH_RESERVATION_ID_SEQUENCE,
    );
    expect(mockMulti.hSet).toHaveBeenCalledWith(
      REDIS_KEYS.PUSH_RESERVATION_DATA(42),
      expect.objectContaining({
        title: '예약 푸시',
        body: '본문',
        reserveTime: '2026-06-01T10:00:00.000Z',
        target: JSON.stringify([1, 2]),
      }),
    );
    expect(mockMulti.zAdd).toHaveBeenCalledWith(
      REDIS_KEYS.PUSH_RESERVATION_ZSET,
      {
        score: new Date('2026-06-01T10:00:00.000Z').getTime(),
        value: REDIS_KEYS.PUSH_RESERVATION_MEMBER(42),
      },
    );
    expect(result).toEqual({
      id: 42,
      title: '예약 푸시',
      body: '본문',
      target: [1, 2],
      reserveTime: '2026-06-01T10:00:00.000Z',
    });
  });

  it('target 미지정 시 빈 문자열로 저장해야 한다', async () => {
    const dto = {
      title: '전체 예약',
      body: '본문',
      reserveTime: '2026-06-01T10:00:00.000Z',
    };

    const result = await useCase.execute(dto);

    expect(mockMulti.hSet).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ target: '' }),
    );
    expect(result.target).toBeUndefined();
  });
});
