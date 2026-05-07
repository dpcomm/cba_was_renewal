import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { Notice } from '@modules/notice/domain/entities/notice.entity';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';
import { RabbitMqProducerService } from '@infrastructure/rabbitmq/rabbitmq.producer.service';
import {
  RABBITMQ_QUEUES,
  RABBITMQ_ROUTING_KEYS,
} from '@shared/constants/rabbitmq.constants';
import { PushNoticeRequestedMessage } from '@infrastructure/rabbitmq/rabbitmq.messages';

@Injectable()
export class SendNoticePushUseCase {
  private readonly logger = new Logger(SendNoticePushUseCase.name);

  constructor(
    @InjectRepository(Notice)
    private readonly noticeRepository: Repository<Notice>,
    private readonly rabbitMqProducer: RabbitMqProducerService,
  ) {}

  async execute(
    id: number,
    options: {
      target?: number[];
      reserveTime?: string;
      includeBody?: boolean;
    },
  ): Promise<void> {
    const notice = await this.noticeRepository.findOne({
      where: { id },
    });

    if (!notice) {
      throw new NotFoundException(ERROR_MESSAGES.NOTICE_NOT_FOUND);
    }

    const includeBody = options.includeBody !== false;

    const message: PushNoticeRequestedMessage = {
      messageId: randomUUID(),
      jobId: randomUUID(),
      eventType: RABBITMQ_ROUTING_KEYS.PUSH_NOTICE_REQUESTED,
      occurredAt: new Date().toISOString(),
      producer: 'cba-was-renewal-api',
      version: 1,
      data: {
        noticeId: id,
        title: notice.title,
        body: includeBody ? notice.body : '',
        target: options.target,
        reserveTime: options.reserveTime,
        includeBody,
      },
      meta: {
        retryCount: 0,
      },
    };

    await this.rabbitMqProducer.publish({
      queue: RABBITMQ_QUEUES.PUSH_REQUESTED,
      routingKey: RABBITMQ_ROUTING_KEYS.PUSH_NOTICE_REQUESTED,
      payload: message,
    });
    this.logger.log(
      `공지 푸시 큐 발행: "${notice.title}" (공지ID: ${id}, 타겟: ${options.target ? options.target.join(',') : '전체'})`,
    );
  }
}
