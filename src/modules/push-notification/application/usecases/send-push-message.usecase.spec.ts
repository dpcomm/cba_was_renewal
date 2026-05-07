import { Test, TestingModule } from '@nestjs/testing';
import { SendPushMessageUseCase } from './send-push-message.usecase';
import { RabbitMqProducerService } from '@infrastructure/rabbitmq/rabbitmq.producer.service';
import {
  RABBITMQ_QUEUES,
  RABBITMQ_ROUTING_KEYS,
} from '@shared/constants/rabbitmq.constants';

// ── Mock Dependencies ───────────────────────────────────────────
const mockRabbitMqProducer = {
  publish: jest.fn().mockResolvedValue(undefined),
};

// ── Tests ───────────────────────────────────────────────────────
describe('SendPushMessageUseCase', () => {
  let useCase: SendPushMessageUseCase;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendPushMessageUseCase,
        {
          provide: RabbitMqProducerService,
          useValue: mockRabbitMqProducer,
        },
      ],
    }).compile();

    useCase = module.get(SendPushMessageUseCase);
  });

  it('푸시 메시지를 큐로 발행해야 한다', async () => {
    await useCase.execute({
      title: '테스트',
      body: '본문',
      target: [1],
    });

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
          meta: expect.objectContaining({ retryCount: 0 }),
        }),
      }),
    );
  });

  it('channelId를 지정하면 해당 값을 사용해야 한다', async () => {
    await useCase.execute({
      title: '제목',
      body: '내용',
      channelId: 'custom',
    });

    expect(mockRabbitMqProducer.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          data: expect.objectContaining({ channelId: 'custom' }),
        }),
      }),
    );
  });

  it('target 미지정 시 undefined로 발행해야 한다', async () => {
    await useCase.execute({ title: '전체', body: '본문' });

    expect(mockRabbitMqProducer.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          data: expect.objectContaining({ target: undefined }),
        }),
      }),
    );
  });

  it('큐 발행 실패 시 예외가 전파되어야 한다', async () => {
    mockRabbitMqProducer.publish.mockRejectedValueOnce(new Error('MQ Error'));

    await expect(
      useCase.execute({ title: '에러', body: '본문' }),
    ).rejects.toThrow('MQ Error');
  });
});
