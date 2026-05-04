import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NoticePushService } from './notice-push.service';
import { PUSH_SENDER_PORT } from './ports/push-sender.port';
import { PushTokenService } from '@modules/push-token/application/push-token.service';
import { Notice } from '@modules/notice/domain/entities/notice.entity';
import { PushToken } from '@modules/push-token/domain/entities/push-token.entity';
import { RabbitMqProducerService } from '@infrastructure/rabbitmq/rabbitmq.producer.service';

// ── Mock Dependencies ───────────────────────────────────────────
const mockNoticeRepository = {
  findOne: jest.fn(),
};

const mockPushSender = {
  send: jest.fn().mockResolvedValue(undefined),
  reserve: jest.fn().mockResolvedValue({
    id: 1,
    title: 'test',
    body: 'body',
    reserveTime: '2026-06-01T10:00:00.000Z',
  }),
};

const mockTokenService = {
  getTokens: jest.fn(),
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

function createToken(token: string, userId = 1): PushToken {
  const entity = new PushToken();
  entity.id = userId;
  entity.userId = userId;
  entity.token = token;
  entity.provider = 'expo';
  entity.createdAt = new Date();
  return entity;
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
          provide: PUSH_SENDER_PORT,
          useValue: mockPushSender,
        },
        {
          provide: PushTokenService,
          useValue: mockTokenService,
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

      expect(mockPushSender.send).not.toHaveBeenCalled();
      expect(mockPushSender.reserve).not.toHaveBeenCalled();
    });

    it('즉시 발송: 제목과 본문을 포함하여 전체 사용자에게 발송해야 한다', async () => {
      const notice = createNotice();
      mockNoticeRepository.findOne.mockResolvedValue(notice);

      const tokens = [
        createToken('ExponentPushToken[a]', 1),
        createToken('ExponentPushToken[b]', 2),
      ];
      mockTokenService.getTokens.mockResolvedValue(tokens);

      await service.sendNoticePush(1, {});

      expect(mockTokenService.getTokens).toHaveBeenCalledWith(undefined);
      expect(mockPushSender.send).toHaveBeenCalledWith(
        tokens,
        expect.objectContaining({
          title: '공지 제목',
          body: '공지 본문 내용입니다.',
          channelId: 'notice',
        }),
      );
      expect(mockRabbitMqProducer.publish).toHaveBeenCalled();
      expect(mockPushSender.reserve).not.toHaveBeenCalled();
    });

    it('즉시 발송: target이 지정되면 해당 사용자에게만 토큰을 조회해야 한다', async () => {
      const notice = createNotice();
      mockNoticeRepository.findOne.mockResolvedValue(notice);
      mockTokenService.getTokens.mockResolvedValue([]);

      await service.sendNoticePush(1, { target: [10, 20] });

      expect(mockTokenService.getTokens).toHaveBeenCalledWith([10, 20]);
    });

    it('includeBody: false → 본문 없이 제목만 발송해야 한다', async () => {
      const notice = createNotice();
      mockNoticeRepository.findOne.mockResolvedValue(notice);
      mockTokenService.getTokens.mockResolvedValue([]);

      await service.sendNoticePush(1, { includeBody: false });

      expect(mockPushSender.send).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          title: '공지 제목',
          body: '',
          channelId: 'notice',
        }),
      );
    });

    it('includeBody 미지정(기본값) → 본문을 포함하여 발송해야 한다', async () => {
      const notice = createNotice();
      mockNoticeRepository.findOne.mockResolvedValue(notice);
      mockTokenService.getTokens.mockResolvedValue([]);

      await service.sendNoticePush(1, {});

      expect(mockPushSender.send).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          body: '공지 본문 내용입니다.',
        }),
      );
    });

    it('예약 발송: reserveTime이 있으면 reserve()를 호출하고 send()는 호출하지 않아야 한다', async () => {
      const notice = createNotice();
      mockNoticeRepository.findOne.mockResolvedValue(notice);

      await service.sendNoticePush(1, {
        reserveTime: '2026-06-01T10:00:00.000Z',
      });

      expect(mockPushSender.reserve).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '공지 제목',
          body: '공지 본문 내용입니다.',
          reserveTime: '2026-06-01T10:00:00.000Z',
        }),
      );
      expect(mockRabbitMqProducer.publish).toHaveBeenCalled();
      expect(mockPushSender.send).not.toHaveBeenCalled();
      expect(mockTokenService.getTokens).not.toHaveBeenCalled();
    });

    it('예약 발송 + includeBody: false → 본문 없이 예약해야 한다', async () => {
      const notice = createNotice();
      mockNoticeRepository.findOne.mockResolvedValue(notice);

      await service.sendNoticePush(1, {
        reserveTime: '2026-06-01T10:00:00.000Z',
        includeBody: false,
      });

      expect(mockPushSender.reserve).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '공지 제목',
          body: '',
        }),
      );
    });

    it('예약 발송 + target 지정 → target이 예약 데이터에 포함되어야 한다', async () => {
      const notice = createNotice();
      mockNoticeRepository.findOne.mockResolvedValue(notice);

      await service.sendNoticePush(1, {
        reserveTime: '2026-06-01T10:00:00.000Z',
        target: [5, 10],
      });

      expect(mockPushSender.reserve).toHaveBeenCalledWith(
        expect.objectContaining({
          target: [5, 10],
        }),
      );
    });
  });
});
