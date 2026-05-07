import { Test, TestingModule } from '@nestjs/testing';
import { PushNoticeWorkerController } from './push-notice.worker-controller';
import { PUSH_SENDER_PORT } from '@modules/push-notification/application/ports/push-sender.port';
import { ReservePushUseCase } from '@modules/push-notification/application/usecases/reserve-push.usecase';
import { GetPushTokensQuery } from '@modules/push-token/application/queries/get-push-tokens.query';
import { RabbitMqProducerService } from '@infrastructure/rabbitmq/rabbitmq.producer.service';
import { REDIS_CLIENT_TOKEN } from '@shared/constants/redis.constants';
import { RABBITMQ_ROUTING_KEYS } from '@shared/constants/rabbitmq.constants';
import { RmqContext } from '@nestjs/microservices';

// ── Mock Dependencies ───────────────────────────────────────────
const mockPushSender = {
  send: jest.fn().mockResolvedValue(undefined),
};

const mockGetPushTokensQuery = {
  execute: jest.fn().mockResolvedValue([{ token: 't1' }]),
};

const mockReservePushUseCase = {
  execute: jest.fn().mockResolvedValue(undefined),
};

const mockRabbitMqProducer = {
  publish: jest.fn().mockResolvedValue(undefined),
};

const mockRedisMulti = {
  set: jest.fn().mockReturnThis(),
  del: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue([]),
};

const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  multi: jest.fn().mockReturnValue(mockRedisMulti),
};

// ── Mock RmqContext ─────────────────────────────────────────────
const mockChannel = {
  ack: jest.fn(),
  nack: jest.fn(),
};

const mockRmqContext = {
  getChannelRef: () => mockChannel,
  getMessage: () => ({}),
} as unknown as RmqContext;

// ── Tests ───────────────────────────────────────────────────────
describe('PushNoticeWorkerController', () => {
  let controller: PushNoticeWorkerController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PushNoticeWorkerController],
      providers: [
        { provide: PUSH_SENDER_PORT, useValue: mockPushSender },
        { provide: GetPushTokensQuery, useValue: mockGetPushTokensQuery },
        { provide: ReservePushUseCase, useValue: mockReservePushUseCase },
        { provide: RabbitMqProducerService, useValue: mockRabbitMqProducer },
        { provide: REDIS_CLIENT_TOKEN, useValue: mockRedis },
      ],
    }).compile();

    controller = module.get(PushNoticeWorkerController);
  });

  describe('handlePushNoticeRequested', () => {
    const mockMessage = {
      messageId: 'm1',
      jobId: 'j1',
      eventType: RABBITMQ_ROUTING_KEYS.PUSH_NOTICE_REQUESTED,
      occurredAt: new Date().toISOString(),
      producer: 'test',
      version: 1,
      data: {
        noticeId: 1,
        title: '공지',
        body: '본문',
        target: undefined,
        reserveTime: undefined,
        includeBody: true,
      },
      meta: { retryCount: 0 },
    };

    it('이미 처리된 메시지면 ack하고 종료해야 한다', async () => {
      mockRedis.get.mockResolvedValueOnce('sent'); // doneKey = true

      await controller.handlePushNoticeRequested(mockMessage, mockRmqContext);

      expect(mockChannel.ack).toHaveBeenCalled();
      expect(mockRedis.set).not.toHaveBeenCalled(); // Lock 안 잡음
    });

    it('락 획득 실패 시 nack(requeue) 해야 한다', async () => {
      mockRedis.get.mockResolvedValueOnce(null); // doneKey = false
      mockRedis.set.mockResolvedValueOnce(null); // lock 획득 실패

      await controller.handlePushNoticeRequested(mockMessage, mockRmqContext);

      expect(mockChannel.nack).toHaveBeenCalledWith(
        expect.anything(),
        false,
        true,
      );
    });

    it('성공적으로 단발 푸시를 처리해야 한다', async () => {
      mockRedis.get.mockResolvedValueOnce(null);
      mockRedis.set.mockResolvedValueOnce('OK'); // lock 획득
      mockRedis.set.mockResolvedValueOnce('OK'); // status = processing

      await controller.handlePushNoticeRequested(mockMessage, mockRmqContext);

      expect(mockGetPushTokensQuery.execute).toHaveBeenCalled();
      expect(mockPushSender.send).toHaveBeenCalled();
      expect(mockRedisMulti.set).toHaveBeenCalledWith(
        expect.stringContaining('done'),
        'sent',
        expect.any(Object),
      );
      expect(mockChannel.ack).toHaveBeenCalled();
    });

    it('reserveTime이 있으면 예약을 등록해야 한다', async () => {
      mockRedis.get.mockResolvedValueOnce(null);
      mockRedis.set.mockResolvedValueOnce('OK');
      mockRedis.set.mockResolvedValueOnce('OK');

      const reserveMessage = {
        ...mockMessage,
        data: { ...mockMessage.data, reserveTime: '2026-01-01T00:00:00Z' },
      };

      await controller.handlePushNoticeRequested(
        reserveMessage,
        mockRmqContext,
      );

      expect(mockReservePushUseCase.execute).toHaveBeenCalled();
      expect(mockPushSender.send).not.toHaveBeenCalled();
      expect(mockChannel.ack).toHaveBeenCalled();
    });

    it('에러 발생 시 handleFailure를 호출하고 1분 재시도 큐로 보내야 한다', async () => {
      mockRedis.get.mockResolvedValueOnce(null);
      mockRedis.set.mockResolvedValueOnce('OK');
      mockRedis.set.mockResolvedValueOnce('OK');

      mockGetPushTokensQuery.execute.mockRejectedValueOnce(
        new Error('Test DB Error'),
      );

      await controller.handlePushNoticeRequested(mockMessage, mockRmqContext);

      // handleFailure calls multi to update status to retrying
      expect(mockRedisMulti.set).toHaveBeenCalledWith(
        expect.stringContaining('status'),
        'retrying',
        expect.any(Object),
      );
      expect(mockRabbitMqProducer.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          routingKey: RABBITMQ_ROUTING_KEYS.PUSH_NOTICE_RETRY_1M,
        }),
      );
      // Even after failure, original message is acked because we re-published to retry queue
      expect(mockChannel.ack).toHaveBeenCalled();
    });
  });
});
