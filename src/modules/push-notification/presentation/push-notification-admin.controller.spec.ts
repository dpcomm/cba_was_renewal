import { Test, TestingModule } from '@nestjs/testing';
import { PushNotificationAdminController } from './push-notification-admin.controller';
import { PUSH_SENDER_PORT } from '@modules/push-notification/application/ports/push-sender.port';
import { NoticePushService } from '@modules/push-notification/application/notice-push.service';
import { RabbitMqProducerService } from '@infrastructure/rabbitmq/rabbitmq.producer.service';
import {
  RABBITMQ_QUEUES,
  RABBITMQ_ROUTING_KEYS,
} from '@shared/constants/rabbitmq.constants';

// ── Mock Dependencies ───────────────────────────────────────────
const mockPushSender = {
  send: jest.fn().mockResolvedValue(undefined),
  reserve: jest.fn().mockResolvedValue({
    id: 1,
    title: '예약',
    body: '본문',
    reserveTime: '2026-06-01T10:00:00.000Z',
  }),
  getReservations: jest.fn().mockResolvedValue([]),
  cancelReservation: jest.fn().mockResolvedValue({
    id: 5,
    title: '취소됨',
    body: '본문',
    reserveTime: '2026-06-01T10:00:00.000Z',
  }),
};

const mockNoticePushService = {
  sendNoticePush: jest.fn().mockResolvedValue(undefined),
};

const mockRabbitMqProducer = {
  publish: jest.fn().mockResolvedValue(undefined),
};

// ── Tests ───────────────────────────────────────────────────────
describe('PushNotificationAdminController', () => {
  let controller: PushNotificationAdminController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PushNotificationAdminController],
      providers: [
        { provide: PUSH_SENDER_PORT, useValue: mockPushSender },
        { provide: NoticePushService, useValue: mockNoticePushService },
        { provide: RabbitMqProducerService, useValue: mockRabbitMqProducer },
      ],
    }).compile();

    controller = module.get(PushNotificationAdminController);
  });

  // ── create() ────────────────────────────────────────────────
  describe('create()', () => {
    it('단일 푸시 메시지를 큐로 발행해야 한다', async () => {
      const dto = { title: '테스트', body: '본문', target: [1] };
      const result = await controller.create(dto);

      expect(mockRabbitMqProducer.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          queue: RABBITMQ_QUEUES.PUSH_REQUESTED,
          routingKey: RABBITMQ_ROUTING_KEYS.PUSH_MESSAGE_REQUESTED,
          payload: expect.objectContaining({
            eventType: RABBITMQ_ROUTING_KEYS.PUSH_MESSAGE_REQUESTED,
            data: expect.objectContaining({
              title: '테스트',
              body: '본문',
              target: [1],
              channelId: 'default',
            }),
            meta: expect.objectContaining({
              retryCount: 0,
            }),
          }),
        }),
      );
      expect(mockPushSender.send).not.toHaveBeenCalled();
      expect(result.data).toBeNull();
    });

    it('target 미지정 시 전체 대상 큐 메시지를 발행해야 한다', async () => {
      const dto = { title: '전체', body: '본문' };
      await controller.create(dto as any);

      expect(mockRabbitMqProducer.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            data: expect.objectContaining({
              target: undefined,
            }),
          }),
        }),
      );
    });

    it('큐 발행에서 에러 발생 시 예외가 전파되어야 한다', async () => {
      mockRabbitMqProducer.publish.mockRejectedValueOnce(
        new Error('Service Error'),
      );

      const dto = { title: '에러', body: '본문' };
      await expect(controller.create(dto as any)).rejects.toThrow(
        'Service Error',
      );
    });
  });

  // ── reserve() ───────────────────────────────────────────────
  describe('reserve()', () => {
    it('예약 요청을 서비스에 위임하고 결과를 반환해야 한다', async () => {
      const dto = {
        title: '예약',
        body: '본문',
        reserveTime: '2026-06-01T10:00:00.000Z',
      };
      const result = await controller.reserve(dto as any);

      expect(mockPushSender.reserve).toHaveBeenCalledWith(
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
    it('예약 목록을 조회하여 반환해야 한다', async () => {
      const mockReservations = [
        {
          id: 1,
          title: '알림1',
          body: '본문1',
          reserveTime: '2026-06-01T10:00:00.000Z',
        },
      ];
      mockPushSender.getReservations.mockResolvedValue(mockReservations);

      const result = await controller.getReservations();

      expect(mockPushSender.getReservations).toHaveBeenCalled();
      expect(result.data).toEqual(mockReservations);
    });

    it('예약이 없으면 빈 배열을 반환해야 한다', async () => {
      mockPushSender.getReservations.mockResolvedValue([]);
      const result = await controller.getReservations();
      expect(result.data).toEqual([]);
    });
  });

  // ── cancelReservation() ─────────────────────────────────────
  describe('cancelReservation()', () => {
    it('예약 취소를 서비스에 위임하고 결과를 반환해야 한다', async () => {
      const result = await controller.cancelReservation(5);

      expect(mockPushSender.cancelReservation).toHaveBeenCalledWith(5);
      expect(result.data).toBeDefined();
    });
  });

  // ── sendNoticePush() ────────────────────────────────────────
  describe('sendNoticePush()', () => {
    it('즉시 발송 시 "Success send notice push" 메시지를 반환해야 한다', async () => {
      const dto = { includeBody: true };
      const result = await controller.sendNoticePush(1, dto as any);

      expect(mockNoticePushService.sendNoticePush).toHaveBeenCalledWith(1, {
        target: undefined,
        reserveTime: undefined,
        includeBody: true,
      });
      expect(result.message).toContain('send');
    });

    it('예약 발송 시 "Success reserve notice push" 메시지를 반환해야 한다', async () => {
      const dto = {
        reserveTime: '2026-06-01T10:00:00.000Z',
        includeBody: true,
      };
      const result = await controller.sendNoticePush(1, dto as any);

      expect(result.message).toContain('reserve');
    });

    it('NoticePushService 에러 시 예외가 전파되어야 한다', async () => {
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
