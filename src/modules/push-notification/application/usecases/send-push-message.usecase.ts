import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { RabbitMqProducerService } from '@infrastructure/rabbitmq/rabbitmq.producer.service';
import {
  RABBITMQ_QUEUES,
  RABBITMQ_ROUTING_KEYS,
} from '@shared/constants/rabbitmq.constants';
import { PushMessageRequestedMessage } from '@infrastructure/rabbitmq/rabbitmq.messages';

@Injectable()
export class SendPushMessageUseCase {
  private readonly logger = new Logger(SendPushMessageUseCase.name);

  constructor(private readonly rabbitMqProducer: RabbitMqProducerService) {}

  async execute(dto: {
    title: string;
    body: string;
    target?: number[];
    channelId?: string;
  }): Promise<void> {
    const message: PushMessageRequestedMessage = {
      messageId: randomUUID(),
      jobId: randomUUID(),
      eventType: RABBITMQ_ROUTING_KEYS.PUSH_MESSAGE_REQUESTED,
      occurredAt: new Date().toISOString(),
      producer: 'cba-was-renewal-api',
      version: 1,
      data: {
        title: dto.title,
        body: dto.body,
        target: dto.target,
        channelId: dto.channelId ?? 'default',
      },
      meta: {
        retryCount: 0,
      },
    };

    await this.rabbitMqProducer.publish({
      queue: RABBITMQ_QUEUES.PUSH_REQUESTED,
      routingKey: RABBITMQ_ROUTING_KEYS.PUSH_MESSAGE_REQUESTED,
      payload: message,
    });

    this.logger.log(
      `푸시 메시지 큐 발행: "${dto.title}" (타겟: ${dto.target ? dto.target.join(',') : '전체'})`,
    );
  }
}
