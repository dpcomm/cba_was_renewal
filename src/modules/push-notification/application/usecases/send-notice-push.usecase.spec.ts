import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SendNoticePushUseCase } from './send-notice-push.usecase';
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
describe('SendNoticePushUseCase', () => {
  let useCase: SendNoticePushUseCase;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendNoticePushUseCase,
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

    useCase = module.get(SendNoticePushUseCase);
  });

  it('존재하지 않는 공지 ID로 호출 시 NotFoundException을 던져야 한다', async () => {
    mockNoticeRepository.findOne.mockResolvedValue(null);

    await expect(useCase.execute(999, {})).rejects.toThrow(NotFoundException);
    expect(mockRabbitMqProducer.publish).not.toHaveBeenCalled();
  });

  it('즉시 발송: 전체 사용자 대상 큐 메시지를 발행해야 한다', async () => {
    mockNoticeRepository.findOne.mockResolvedValue(createNotice());

    await useCase.execute(1, {});

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
            includeBody: true,
          }),
        }),
      }),
    );
  });

  it('target이 지정되면 큐 메시지에 target을 포함해야 한다', async () => {
    mockNoticeRepository.findOne.mockResolvedValue(createNotice());

    await useCase.execute(1, { target: [10, 20] });

    expect(mockRabbitMqProducer.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          data: expect.objectContaining({ target: [10, 20] }),
        }),
      }),
    );
  });

  it('includeBody: false → 본문 없이 발행해야 한다', async () => {
    mockNoticeRepository.findOne.mockResolvedValue(createNotice());

    await useCase.execute(1, { includeBody: false });

    expect(mockRabbitMqProducer.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          data: expect.objectContaining({ body: '', includeBody: false }),
        }),
      }),
    );
  });

  it('reserveTime이 있으면 예약 정보가 큐 메시지에 포함되어야 한다', async () => {
    mockNoticeRepository.findOne.mockResolvedValue(createNotice());

    await useCase.execute(1, { reserveTime: '2026-06-01T10:00:00.000Z' });

    expect(mockRabbitMqProducer.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          data: expect.objectContaining({
            reserveTime: '2026-06-01T10:00:00.000Z',
          }),
        }),
      }),
    );
  });
});
