import { Test, TestingModule } from '@nestjs/testing';
import { PushNotificationAdminController } from './push-notification-admin.controller';
import { SendPushMessageUseCase } from '../application/usecases/send-push-message.usecase';
import { SendNoticePushUseCase } from '../application/usecases/send-notice-push.usecase';
import { ReservePushUseCase } from '../application/usecases/reserve-push.usecase';
import { CancelReservationUseCase } from '../application/usecases/cancel-reservation.usecase';
import { GetReservationsQuery } from '../application/queries/get-reservations.query';

// ── Mock Dependencies ───────────────────────────────────────────
const mockSendPushMessage = {
  execute: jest.fn().mockResolvedValue(undefined),
};

const mockSendNoticePush = {
  execute: jest.fn().mockResolvedValue(undefined),
};

const mockReservePush = {
  execute: jest.fn().mockResolvedValue({
    id: 1,
    title: '예약',
    body: '본문',
    reserveTime: '2026-06-01T10:00:00.000Z',
  }),
};

const mockCancelReservation = {
  execute: jest.fn().mockResolvedValue({
    id: 5,
    title: '취소됨',
    body: '본문',
    reserveTime: '2026-06-01T10:00:00.000Z',
  }),
};

const mockGetReservations = {
  execute: jest.fn().mockResolvedValue([]),
};

// ── Tests ───────────────────────────────────────────────────────
describe('PushNotificationAdminController', () => {
  let controller: PushNotificationAdminController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PushNotificationAdminController],
      providers: [
        { provide: SendPushMessageUseCase, useValue: mockSendPushMessage },
        { provide: SendNoticePushUseCase, useValue: mockSendNoticePush },
        { provide: ReservePushUseCase, useValue: mockReservePush },
        { provide: CancelReservationUseCase, useValue: mockCancelReservation },
        { provide: GetReservationsQuery, useValue: mockGetReservations },
      ],
    }).compile();

    controller = module.get(PushNotificationAdminController);
  });

  // ── create() ────────────────────────────────────────────────
  describe('create()', () => {
    it('SendPushMessageUseCase에 위임해야 한다', async () => {
      const dto = { title: '테스트', body: '본문', target: [1] };
      const result = await controller.create(dto);

      expect(mockSendPushMessage.execute).toHaveBeenCalledWith({
        title: '테스트',
        body: '본문',
        target: [1],
        channelId: 'default',
      });
      expect(result.data).toBeNull();
    });

    it('에러 시 예외가 전파되어야 한다', async () => {
      mockSendPushMessage.execute.mockRejectedValueOnce(
        new Error('Service Error'),
      );

      await expect(
        controller.create({ title: '에러', body: '본문' } as any),
      ).rejects.toThrow('Service Error');
    });
  });

  // ── reserve() ───────────────────────────────────────────────
  describe('reserve()', () => {
    it('ReservePushUseCase에 위임하고 결과를 반환해야 한다', async () => {
      const dto = {
        title: '예약',
        body: '본문',
        reserveTime: '2026-06-01T10:00:00.000Z',
      };
      const result = await controller.reserve(dto as any);

      expect(mockReservePush.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '예약',
          body: '본문',
          reserveTime: '2026-06-01T10:00:00.000Z',
        }),
      );
      expect(result.data).toBeDefined();
    });
  });

  // ── getReservations() ───────────────────────────────────────
  describe('getReservations()', () => {
    it('GetReservationsQuery에 위임해야 한다', async () => {
      const mockReservations = [
        {
          id: 1,
          title: '알림1',
          body: '본문1',
          reserveTime: '2026-06-01T10:00:00.000Z',
        },
      ];
      mockGetReservations.execute.mockResolvedValue(mockReservations);

      const result = await controller.getReservations();

      expect(mockGetReservations.execute).toHaveBeenCalled();
      expect(result.data).toEqual(mockReservations);
    });

    it('예약이 없으면 빈 배열을 반환해야 한다', async () => {
      mockGetReservations.execute.mockResolvedValue([]);
      const result = await controller.getReservations();
      expect(result.data).toEqual([]);
    });
  });

  // ── cancelReservation() ─────────────────────────────────────
  describe('cancelReservation()', () => {
    it('CancelReservationUseCase에 위임하고 결과를 반환해야 한다', async () => {
      const result = await controller.cancelReservation(5);

      expect(mockCancelReservation.execute).toHaveBeenCalledWith(5);
      expect(result.data).toBeDefined();
    });
  });

  // ── sendNoticePush() ────────────────────────────────────────
  describe('sendNoticePush()', () => {
    it('즉시 발송 시 "send" 메시지를 반환해야 한다', async () => {
      const dto = { includeBody: true };
      const result = await controller.sendNoticePush(1, dto as any);

      expect(mockSendNoticePush.execute).toHaveBeenCalledWith(1, {
        target: undefined,
        reserveTime: undefined,
        includeBody: true,
      });
      expect(result.message).toContain('send');
    });

    it('예약 발송 시 "reserve" 메시지를 반환해야 한다', async () => {
      const dto = {
        reserveTime: '2026-06-01T10:00:00.000Z',
        includeBody: true,
      };
      const result = await controller.sendNoticePush(1, dto as any);
      expect(result.message).toContain('reserve');
    });

    it('UseCase 에러 시 예외가 전파되어야 한다', async () => {
      mockSendNoticePush.execute.mockRejectedValueOnce(
        new Error('Notice not found'),
      );

      await expect(
        controller.sendNoticePush(999, { includeBody: true } as any),
      ).rejects.toThrow('Notice not found');
    });
  });
});
