import { Test, TestingModule } from '@nestjs/testing';
import { CancelReservationUseCase } from './cancel-reservation.usecase';
import {
  REDIS_CLIENT_TOKEN,
  REDIS_KEYS,
} from '@shared/constants/redis.constants';

// ── Mock Redis ──────────────────────────────────────────────────
const mockMulti = {
  zRem: jest.fn().mockReturnThis(),
  del: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue([]),
};

const mockRedis = {
  hGetAll: jest.fn(),
  multi: jest.fn().mockReturnValue(mockMulti),
};

// ── Tests ───────────────────────────────────────────────────────
describe('CancelReservationUseCase', () => {
  let useCase: CancelReservationUseCase;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CancelReservationUseCase,
        { provide: REDIS_CLIENT_TOKEN, useValue: mockRedis },
      ],
    }).compile();

    useCase = module.get(CancelReservationUseCase);
  });

  it('예약을 취소하고 결과를 반환해야 한다', async () => {
    mockRedis.hGetAll.mockResolvedValue({
      title: '예약 제목',
      body: '본문',
      reserveTime: '2026-06-01T10:00:00.000Z',
      target: JSON.stringify([1, 2]),
    });

    const result = await useCase.execute(5);

    expect(mockRedis.hGetAll).toHaveBeenCalledWith(
      REDIS_KEYS.PUSH_RESERVATION_DATA(5),
    );
    expect(mockMulti.zRem).toHaveBeenCalledWith(
      REDIS_KEYS.PUSH_RESERVATION_ZSET,
      REDIS_KEYS.PUSH_RESERVATION_MEMBER(5),
    );
    expect(mockMulti.del).toHaveBeenCalledWith(
      REDIS_KEYS.PUSH_RESERVATION_DATA(5),
    );
    expect(result).toEqual({
      id: 5,
      title: '예약 제목',
      body: '본문',
      target: [1, 2],
      reserveTime: '2026-06-01T10:00:00.000Z',
    });
  });

  it('존재하지 않는 예약 취소 시 빈 결과를 반환해야 한다 (멱등성)', async () => {
    mockRedis.hGetAll.mockResolvedValue({});

    const result = await useCase.execute(999);

    expect(mockMulti.zRem).not.toHaveBeenCalled();
    expect(result).toEqual({
      id: 999,
      title: '',
      body: '',
      reserveTime: '',
    });
  });
});
