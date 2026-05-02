import { Test, TestingModule } from '@nestjs/testing';
import { PushNofiticationController } from './push-notification.controller';
import { ExpoNotificationService } from '@modules/push-notification/application/services/expo-notification/ExpoNotification.service';
import { ExpoPushTokenService } from '@modules/expo-push-token/application/services/expo-push-token.service';
import { NoticePushService } from '@modules/push-notification/application/services/notice-push.service';
import { ExpoPushToken } from '@modules/expo-push-token/domain/entities/expo-push-token.entity';

// ── Mock Services ───────────────────────────────────────────────
const mockExpoService = {
  send: jest.fn().mockResolvedValue(undefined),
  reserve: jest.fn(),
  getReservations: jest.fn(),
  cancelReservation: jest.fn(),
};

const mockTokenService = {
  getTokens: jest.fn(),
};

const mockNoticePushService = {
  sendNoticePush: jest.fn().mockResolvedValue(undefined),
};

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
describe('PushNotificationController', () => {
  let controller: PushNofiticationController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PushNofiticationController],
      providers: [
        { provide: ExpoNotificationService, useValue: mockExpoService },
        { provide: ExpoPushTokenService, useValue: mockTokenService },
        { provide: NoticePushService, useValue: mockNoticePushService },
      ],
    }).compile();

    controller = module.get(PushNofiticationController);
  });

  // ── create() ────────────────────────────────────────────────
  describe('create()', () => {
    it('토큰을 조회한 후 Expo 서비스로 즉시 발송해야 한다', async () => {
      const tokens = [createToken('ExponentPushToken[valid]')];
      mockTokenService.getTokens.mockResolvedValue(tokens);

      const dto = { title: '테스트', body: '본문', target: [1] };
      const result = await controller.create(dto);

      expect(mockTokenService.getTokens).toHaveBeenCalledWith([1]);
      expect(mockExpoService.send).toHaveBeenCalledWith(
        tokens,
        expect.objectContaining({ title: '테스트', body: '본문' }),
      );
      expect(result.data).toBeNull();
    });

    it('target 미지정 시 전체 토큰을 조회해야 한다', async () => {
      mockTokenService.getTokens.mockResolvedValue([]);

      const dto = { title: '전체', body: '본문' };
      await controller.create(dto as any);

      expect(mockTokenService.getTokens).toHaveBeenCalledWith(undefined);
    });

    it('Expo 서비스에서 에러 발생 시 예외가 전파되어야 한다', async () => {
      mockTokenService.getTokens.mockResolvedValue([]);
      mockExpoService.send.mockRejectedValueOnce(new Error('Service Error'));

      const dto = { title: '에러', body: '본문' };
      await expect(controller.create(dto as any)).rejects.toThrow(
        'Service Error',
      );
    });
  });

  // ── reserve() ───────────────────────────────────────────────
  describe('reserve()', () => {
    it('예약 요청을 서비스에 위임하고 결과를 반환해야 한다', async () => {
      const reserveResponse = {
        id: 1,
        title: '예약',
        body: '본문',
        reserveTime: '2026-06-01T10:00:00.000Z',
      };
      mockExpoService.reserve.mockResolvedValue(reserveResponse);

      const dto = {
        title: '예약',
        body: '본문',
        reserveTime: '2026-06-01T10:00:00.000Z',
      };
      const result = await controller.reserve(dto as any);

      expect(mockExpoService.reserve).toHaveBeenCalledWith(dto);
      expect(result.data).toEqual(reserveResponse);
    });
  });

  // ── getReservations() ───────────────────────────────────────
  describe('getReservations()', () => {
    it('예약 목록을 서비스에서 조회하여 반환해야 한다', async () => {
      const mockReservations = [
        {
          id: 1,
          title: '알림1',
          body: '본문1',
          reserveTime: '2026-06-01T10:00:00.000Z',
        },
      ];
      mockExpoService.getReservations.mockResolvedValue(mockReservations);

      const result = await controller.getReservations();

      expect(mockExpoService.getReservations).toHaveBeenCalled();
      expect(result.data).toEqual(mockReservations);
    });

    it('예약이 없으면 빈 배열을 반환해야 한다', async () => {
      mockExpoService.getReservations.mockResolvedValue([]);

      const result = await controller.getReservations();

      expect(result.data).toEqual([]);
    });
  });

  // ── cancelReservation() ─────────────────────────────────────
  describe('cancelReservation()', () => {
    it('예약 취소를 서비스에 위임하고 결과를 반환해야 한다', async () => {
      const cancelResponse = {
        id: 5,
        title: '취소됨',
        body: '본문',
        reserveTime: '2026-06-01T10:00:00.000Z',
      };
      mockExpoService.cancelReservation.mockResolvedValue(cancelResponse);

      const result = await controller.cancelReservation(5);

      expect(mockExpoService.cancelReservation).toHaveBeenCalledWith(5);
      expect(result.data).toEqual(cancelResponse);
    });
  });

  // ── sendNoticePush() ────────────────────────────────────────
  describe('sendNoticePush()', () => {
    it('즉시 발송 시 "Success send notice push" 메시지를 반환해야 한다', async () => {
      const dto = { includeBody: true };
      const result = await controller.sendNoticePush(1, dto as any);

      expect(mockNoticePushService.sendNoticePush).toHaveBeenCalledWith(1, dto);
      expect(result.message).toContain('send');
    });

    it('예약 발송 시 "Success reserve notice push" 메시지를 반환해야 한다', async () => {
      const dto = {
        reserveTime: '2026-06-01T10:00:00.000Z',
        includeBody: true,
      };
      const result = await controller.sendNoticePush(1, dto as any);

      expect(mockNoticePushService.sendNoticePush).toHaveBeenCalledWith(1, dto);
      expect(result.message).toContain('reserve');
    });

    it('NoticePushService 에러 시 예외가 컨트롤러를 통해 전파되어야 한다', async () => {
      mockNoticePushService.sendNoticePush.mockRejectedValueOnce(
        new Error('Notice not found'),
      );

      const dto = { includeBody: true };
      await expect(controller.sendNoticePush(999, dto as any)).rejects.toThrow(
        'Notice not found',
      );
    });
  });
});
