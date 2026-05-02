import { Test, TestingModule } from '@nestjs/testing';
import { ExpoNotificationService } from './ExpoNotification.service';
import { ExpoPushToken } from '@modules/expo-push-token/domain/entities/expo-push-token.entity';

// ── Mock: Redis client ──────────────────────────────────────────
const execMock = jest.fn().mockResolvedValue([]);
const mockRedis = {
  incr: jest.fn(),
  hSet: jest.fn(),
  hGetAll: jest.fn(),
  zAdd: jest.fn(),
  zRangeWithScores: jest.fn(),
  zRangeByScore: jest.fn(),
  zRem: jest.fn(),
  del: jest.fn(),
  multi: jest.fn().mockReturnValue({
    hSet: jest.fn().mockReturnThis(),
    zAdd: jest.fn().mockReturnThis(),
    zRem: jest.fn().mockReturnThis(),
    del: jest.fn().mockReturnThis(),
    exec: execMock,
  }),
};

// ── Mock: Expo SDK ──────────────────────────────────────────────
const mockIsExpoPushToken = jest.fn();
const mockChunkPushNotifications = jest.fn((messages) => [messages]);
const mockSendPushNotificationsAsync = jest
  .fn()
  .mockResolvedValue([{ status: 'ok', id: 'ticket-1' }]);

jest.mock('expo-server-sdk', () => ({
  Expo: Object.assign(
    jest.fn().mockImplementation(() => ({
      chunkPushNotifications: mockChunkPushNotifications,
      sendPushNotificationsAsync: mockSendPushNotificationsAsync,
    })),
    { isExpoPushToken: (...args: any[]) => mockIsExpoPushToken(...args) },
  ),
}));

// ── Helpers ─────────────────────────────────────────────────────
function createToken(token: string, userId = 1): ExpoPushToken {
  const entity = new ExpoPushToken();
  entity.id = userId;
  entity.userId = userId;
  entity.token = token;
  entity.provider = 'expo';
  entity.createdAt = new Date();
  return entity;
}

// ── Tests ───────────────────────────────────────────────────────
describe('ExpoNotificationService', () => {
  let service: ExpoNotificationService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpoNotificationService,
        { provide: 'REDIS_CLIENT', useValue: mockRedis },
      ],
    }).compile();

    service = module.get(ExpoNotificationService);
  });

  // ── send() ──────────────────────────────────────────────────
  describe('send()', () => {
    const notification = {
      title: '테스트',
      body: '본문',
      channelId: 'default',
    };

    it('유효한 토큰으로 푸시 메시지를 정상 전송해야 한다', async () => {
      const tokens = [createToken('ExponentPushToken[valid-1]')];
      mockIsExpoPushToken.mockReturnValue(true);

      await service.send(tokens, notification);

      expect(mockChunkPushNotifications).toHaveBeenCalledTimes(1);
      expect(mockSendPushNotificationsAsync).toHaveBeenCalledTimes(1);
    });

    it('유효하지 않은 토큰은 필터링하고 빈 메시지는 전송하지 않아야 한다', async () => {
      const tokens = [createToken('invalid-token')];
      mockIsExpoPushToken.mockReturnValue(false);

      await service.send(tokens, notification);

      // 유효 토큰이 0개이므로 빈 배열로 chunk 호출
      expect(mockChunkPushNotifications).toHaveBeenCalledWith([]);
    });

    it('유효/무효 토큰이 섞여 있으면 유효한 것만 골라 전송해야 한다', async () => {
      const tokens = [
        createToken('ExponentPushToken[valid-1]', 1),
        createToken('invalid-token-2', 2),
        createToken('ExponentPushToken[valid-3]', 3),
        createToken('bad-token-4', 4),
        createToken('ExponentPushToken[valid-5]', 5),
      ];

      // 토큰 문자열에 'ExponentPushToken'이 포함되면 유효
      mockIsExpoPushToken.mockImplementation((token: string) =>
        token.startsWith('ExponentPushToken'),
      );

      await service.send(tokens, notification);

      // 유효 토큰 3개만 메시지로 만들어져야 함
      const passedMessages = mockChunkPushNotifications.mock.calls[0][0];
      expect(passedMessages).toHaveLength(3);
      expect(passedMessages[0].to).toBe('ExponentPushToken[valid-1]');
      expect(passedMessages[1].to).toBe('ExponentPushToken[valid-3]');
      expect(passedMessages[2].to).toBe('ExponentPushToken[valid-5]');
    });

    it('빈 토큰 배열이 들어오면 전송 없이 정상 종료해야 한다', async () => {
      await service.send([], notification);

      expect(mockChunkPushNotifications).toHaveBeenCalledWith([]);
    });

    it('data 파라미터가 전달되면 메시지에 포함되어야 한다', async () => {
      const tokens = [createToken('ExponentPushToken[valid]')];
      const customData = { noticeId: 42, screen: 'NoticeDetail' };
      mockIsExpoPushToken.mockReturnValue(true);

      await service.send(tokens, notification, customData);

      const passedMessages = mockChunkPushNotifications.mock.calls[0][0];
      expect(passedMessages[0].data).toEqual(customData);
    });

    it('메시지에 title, body, channelId, sound가 올바르게 매핑되어야 한다', async () => {
      const tokens = [createToken('ExponentPushToken[valid]')];
      mockIsExpoPushToken.mockReturnValue(true);

      await service.send(tokens, notification);

      const passedMessages = mockChunkPushNotifications.mock.calls[0][0];
      expect(passedMessages[0]).toEqual(
        expect.objectContaining({
          to: 'ExponentPushToken[valid]',
          sound: 'default',
          title: '테스트',
          body: '본문',
          channelId: 'default',
        }),
      );
    });

    it('Expo SDK 에러 시 예외를 던지지 않고 로그만 남겨야 한다', async () => {
      const tokens = [createToken('ExponentPushToken[valid-1]')];
      mockIsExpoPushToken.mockReturnValue(true);

      mockSendPushNotificationsAsync.mockRejectedValueOnce(
        new Error('Expo API Error'),
      );

      // 에러를 삼키고 정상 종료되어야 함
      await expect(service.send(tokens, notification)).resolves.toBeUndefined();
    });
  });

  // ── reserve() ───────────────────────────────────────────────
  describe('reserve()', () => {
    it('Redis에 예약 데이터를 저장하고 응답을 반환해야 한다', async () => {
      mockRedis.incr.mockResolvedValue(42);

      const dto = {
        title: '예약 테스트',
        body: '본문',
        reserveTime: '2026-06-01T10:00:00.000Z',
        target: [1, 2, 3],
      };

      const result = await service.reserve(dto);

      expect(mockRedis.incr).toHaveBeenCalledWith(
        'notification:reservation:id',
      );
      expect(mockRedis.multi).toHaveBeenCalled();

      expect(result).toEqual({
        id: 42,
        title: '예약 테스트',
        body: '본문',
        reserveTime: '2026-06-01T10:00:00.000Z',
      });
    });

    it('target이 undefined인 전체 발송 예약도 정상 처리해야 한다', async () => {
      mockRedis.incr.mockResolvedValue(1);

      const dto = {
        title: '전체 발송',
        body: '본문',
        reserveTime: '2026-06-01T10:00:00.000Z',
        // target 미지정 → 전체 발송
      };

      const result = await service.reserve(dto as any);

      expect(result.id).toBe(1);
      expect(result.title).toBe('전체 발송');
      expect(mockRedis.multi).toHaveBeenCalled();
    });
  });

  // ── getReservations() ───────────────────────────────────────
  describe('getReservations()', () => {
    it('예약된 알림 목록을 반환해야 한다', async () => {
      mockRedis.zRangeWithScores.mockResolvedValue([
        { value: 'reservation:1', score: 1000 },
        { value: 'reservation:2', score: 2000 },
      ]);

      mockRedis.hGetAll
        .mockResolvedValueOnce({
          title: '알림1',
          body: '본문1',
          target: '',
          reserveTime: '2026-06-01T10:00:00.000Z',
        })
        .mockResolvedValueOnce({
          title: '알림2',
          body: '본문2',
          target: JSON.stringify([1, 2]),
          reserveTime: '2026-06-02T10:00:00.000Z',
        });

      const results = await service.getReservations();

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({
        id: 1,
        title: '알림1',
        body: '본문1',
        target: null,
        reserveTime: '2026-06-01T10:00:00.000Z',
      });
      expect(results[1].target).toEqual([1, 2]);
    });

    it('데이터가 없는 멤버는 건너뛰어야 한다', async () => {
      mockRedis.zRangeWithScores.mockResolvedValue([
        { value: 'reservation:99', score: 9999 },
      ]);

      mockRedis.hGetAll.mockResolvedValueOnce({});

      const results = await service.getReservations();
      expect(results).toHaveLength(0);
    });

    it('예약이 아예 없으면 빈 배열을 반환해야 한다', async () => {
      mockRedis.zRangeWithScores.mockResolvedValue([]);

      const results = await service.getReservations();

      expect(results).toHaveLength(0);
      expect(mockRedis.hGetAll).not.toHaveBeenCalled();
    });
  });

  // ── cancelReservation() ─────────────────────────────────────
  describe('cancelReservation()', () => {
    it('예약을 정상적으로 취소해야 한다', async () => {
      mockRedis.hGetAll.mockResolvedValue({
        title: '취소 테스트',
        body: '본문',
        reserveTime: '2026-06-01T10:00:00.000Z',
      });

      const result = await service.cancelReservation(5);

      expect(mockRedis.multi).toHaveBeenCalled();
      expect(result).toEqual({
        id: 5,
        title: '취소 테스트',
        body: '본문',
        reserveTime: '2026-06-01T10:00:00.000Z',
      });
    });

    it('이미 삭제된 예약에 대해 멱등적으로 빈 응답을 반환해야 한다', async () => {
      mockRedis.hGetAll.mockResolvedValue({});

      const result = await service.cancelReservation(999);

      expect(result).toEqual({
        id: 999,
        title: '',
        body: '',
        reserveTime: '',
      });
    });
  });

  // ── popDueReservations() ────────────────────────────────────
  describe('popDueReservations()', () => {
    it('시간이 도래한 예약들을 꺼내고 Redis에서 삭제해야 한다', async () => {
      const nowMs = Date.now();
      mockRedis.zRangeByScore.mockResolvedValue([
        'reservation:10',
        'reservation:11',
      ]);

      mockRedis.hGetAll
        .mockResolvedValueOnce({
          title: '만료1',
          body: '본문1',
          target: '',
          reserveTime: '2026-05-01T00:00:00.000Z',
        })
        .mockResolvedValueOnce({
          title: '만료2',
          body: '본문2',
          target: JSON.stringify([5]),
          reserveTime: '2026-05-02T00:00:00.000Z',
        });

      const results = await service.popDueReservations(nowMs);

      expect(results).toHaveLength(2);
      expect(results[0].title).toBe('만료1');
      expect(results[1].target).toEqual([5]);

      // multi() → zRem + del 호출 확인
      expect(mockRedis.multi).toHaveBeenCalled();
    });

    it('도래한 예약이 없으면 빈 배열을 즉시 반환해야 한다', async () => {
      mockRedis.zRangeByScore.mockResolvedValue([]);

      const results = await service.popDueReservations(Date.now());

      expect(results).toHaveLength(0);
      expect(mockRedis.multi).not.toHaveBeenCalled();
    });

    it('일부 멤버의 Hash 데이터가 누락되어도 나머지는 정상 반환해야 한다', async () => {
      mockRedis.zRangeByScore.mockResolvedValue([
        'reservation:20',
        'reservation:21',
        'reservation:22',
      ]);

      mockRedis.hGetAll
        .mockResolvedValueOnce({
          title: '정상',
          body: '본문',
          target: '',
          reserveTime: '2026-05-01T00:00:00.000Z',
        })
        .mockResolvedValueOnce({}) // Hash 데이터 누락
        .mockResolvedValueOnce({
          title: '정상2',
          body: '본문2',
          target: '',
          reserveTime: '2026-05-03T00:00:00.000Z',
        });

      const results = await service.popDueReservations(Date.now());

      // 3개 중 Hash 누락 1개를 제외한 2개만 반환
      expect(results).toHaveLength(2);
      expect(results[0].title).toBe('정상');
      expect(results[1].title).toBe('정상2');

      // Redis 삭제는 3개 모두 대상 (ZSet에서 이미 꺼냈으므로)
      expect(mockRedis.multi).toHaveBeenCalled();
    });
  });
});
