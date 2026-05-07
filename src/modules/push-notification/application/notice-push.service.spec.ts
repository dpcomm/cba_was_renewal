import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NoticePushService } from './notice-push.service';
import { Notice } from '@modules/notice/domain/entities/notice.entity';
import { RabbitMqProducerService } from '@infrastructure/rabbitmq/rabbitmq.producer.service';
import {
  RABBITMQ_QUEUES,
  RABBITMQ_ROUTING_KEYS,
} from '@shared/constants/rabbitmq.constants';

// ── Mock Dependencies ───────────────────────────────────────────
const mockNoticeRepository = {
  findOne: jest.fn(),
};

const mockRabbitMqProducer = {
  publish: jest.fn().mockResolvedValue(undefined),
};

// ── Helpers ─────────────────────────────────────────────────────
function createNotice(overrides?: Partial<Notice>): Notice {
  const notice = new Notice();
  notice.id = overrides?.id ?? 1;
  notice.title = overrides?.title ?? '공지 제목';
  notice.body = overrides?.body ?? '공지 본문 내용입니다.';
  return notice;
}

// ── Tests ───────────────────────────────────────────────────────
describe('NoticePushService', () => {
  let service: NoticePushService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NoticePushService,
        {
          provide: getRepositoryToken(Notice),
          useValue: mockNoticeRepository,
        },
        {
          provide: RabbitMqProducerService,
          useValue: mockRabbitMqProducer,
        },
      ],
    }).compile();

    service = module.get(NoticePushService);
  });

  // ── sendNoticePush() ────────────────────────────────────────
  describe('sendNoticePush()', () => {
    it('존재하지 않는 공지 ID로 호출 시 NotFoundException을 던져야 한다', async () => {
      mockNoticeRepository.findOne.mockResolvedValue(null);

      await expect(service.sendNoticePush(999, {})).rejects.toThrow(
        NotFoundException,
      );

      expect(mockRabbitMqProducer.publish).not.toHaveBeenCalled();
    });

    it('즉시 발송: 제목과 본문을 포함하여 전체 사용자 대상 큐 메시지를 발행해야 한다', async () => {
      const notice = createNotice();
      mockNoticeRepository.findOne.mockResolvedValue(notice);

      await service.sendNoticePush(1, {});

      expect(mockRabbitMqProducer.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          queue: RABBITMQ_QUEUES.PUSH_REQUESTED,
          routingKey: RABBITMQ_ROUTING_KEYS.PUSH_NOTICE_REQUESTED,
          payload: expect.objectContaining({
            eventType: RABBITMQ_ROUTING_KEYS.PUSH_NOTICE_REQUESTED,
            data: expect.objectContaining({
              noticeId: 1,
              title: '공지 제목',
              body: '공지 본문 내용입니다.',
              target: undefined,
              reserveTime: undefined,
              includeBody: true,
            }),
            meta: expect.objectContaining({
              retryCount: 0,
            }),
          }),
        }),
      );
    });

    it('즉시 발송: target이 지정되면 큐 메시지에 target을 포함해야 한다', async () => {
      const notice = createNotice();
      mockNoticeRepository.findOne.mockResolvedValue(notice);

      await service.sendNoticePush(1, { target: [10, 20] });

      expect(mockRabbitMqProducer.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            data: expect.objectContaining({
              target: [10, 20],
            }),
          }),
        }),
      );
    });

    it('includeBody: false → 본문 없이 제목만 큐 메시지로 발행해야 한다', async () => {
      const notice = createNotice();
      mockNoticeRepository.findOne.mockResolvedValue(notice);

      await service.sendNoticePush(1, { includeBody: false });

      expect(mockRabbitMqProducer.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            data: expect.objectContaining({
              title: '공지 제목',
              body: '',
              includeBody: false,
            }),
          }),
        }),
      );
    });

    it('includeBody 미지정(기본값) → 본문을 포함하여 큐 메시지를 발행해야 한다', async () => {
      const notice = createNotice();
      mockNoticeRepository.findOne.mockResolvedValue(notice);

      await service.sendNoticePush(1, {});

      expect(mockRabbitMqProducer.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            data: expect.objectContaining({
              body: '공지 본문 내용입니다.',
              includeBody: true,
            }),
          }),
        }),
      );
    });

    it('예약 발송: reserveTime이 있으면 예약 큐 메시지를 발행해야 한다', async () => {
      const notice = createNotice();
      mockNoticeRepository.findOne.mockResolvedValue(notice);

      await service.sendNoticePush(1, {
        reserveTime: '2026-06-01T10:00:00.000Z',
      });

      expect(mockRabbitMqProducer.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            data: expect.objectContaining({
              title: '공지 제목',
              body: '공지 본문 내용입니다.',
              reserveTime: '2026-06-01T10:00:00.000Z',
            }),
          }),
        }),
      );
    });

    it('예약 발송 + includeBody: false → 본문 없이 예약 큐 메시지를 발행해야 한다', async () => {
      const notice = createNotice();
      mockNoticeRepository.findOne.mockResolvedValue(notice);

      await service.sendNoticePush(1, {
        reserveTime: '2026-06-01T10:00:00.000Z',
        includeBody: false,
      });

      expect(mockRabbitMqProducer.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            data: expect.objectContaining({
              title: '공지 제목',
              body: '',
            }),
          }),
        }),
      );
    });

    it('예약 발송 + target 지정 → target이 예약 큐 메시지에 포함되어야 한다', async () => {
      const notice = createNotice();
      mockNoticeRepository.findOne.mockResolvedValue(notice);

      await service.sendNoticePush(1, {
        reserveTime: '2026-06-01T10:00:00.000Z',
        target: [5, 10],
      });

      expect(mockRabbitMqProducer.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            data: expect.objectContaining({
              target: [5, 10],
            }),
          }),
        }),
      );
    });
  });
});
