import { Controller, Inject, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { RedisClientType } from 'redis';
import { RabbitMqProducerService } from '@infrastructure/rabbitmq/rabbitmq.producer.service';
import {
  IPushSenderPort,
  PUSH_SENDER_PORT,
} from '@modules/push-notification/application/ports/push-sender.port';
import { PushTokenService } from '@modules/push-token/application/push-token.service';
import {
  RABBITMQ_QUEUES,
  RABBITMQ_ROUTING_KEYS,
} from '@shared/constants/rabbitmq.constants';
import {
  REDIS_CLIENT_TOKEN,
  REDIS_KEYS,
  REDIS_TTL_SECONDS,
} from '@shared/constants/redis.constants';
import {
  PushMessageRequestedMessage,
  PushNoticeRequestedMessage,
} from '@infrastructure/rabbitmq/rabbitmq.messages';

type PushWorkerMessage =
  | PushNoticeRequestedMessage
  | PushMessageRequestedMessage;

interface NormalizedPushData {
  title: string;
  body: string;
  target?: number[];
  channelId: string;
  reserveTime?: string;
  logLabel: string;
}

@Controller()
export class PushNoticeWorkerController {
  private readonly logger = new Logger(PushNoticeWorkerController.name);
  private readonly workerId = `push-worker:${process.pid}`;

  constructor(
    @Inject(PUSH_SENDER_PORT)
    private readonly pushSender: IPushSenderPort,
    private readonly pushTokenService: PushTokenService,
    private readonly rabbitMqProducer: RabbitMqProducerService,
    @Inject(REDIS_CLIENT_TOKEN) private readonly redis: RedisClientType,
  ) {}

  @EventPattern(RABBITMQ_ROUTING_KEYS.PUSH_NOTICE_REQUESTED)
  async handlePushNoticeRequested(
    @Payload() message: PushNoticeRequestedMessage,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    await this.processPushMessage(
      message,
      {
        title: message.data.title,
        body: message.data.body,
        target: message.data.target,
        reserveTime: message.data.reserveTime,
        channelId: 'notice',
        logLabel: `notice=${message.data.noticeId}`,
      },
      context,
    );
  }

  @EventPattern(RABBITMQ_ROUTING_KEYS.PUSH_MESSAGE_REQUESTED)
  async handlePushMessageRequested(
    @Payload() message: PushMessageRequestedMessage,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    await this.processPushMessage(
      message,
      {
        title: message.data.title,
        body: message.data.body,
        target: message.data.target,
        reserveTime: message.data.reserveTime,
        channelId: message.data.channelId,
        logLabel: `message=${message.jobId}`,
      },
      context,
    );
  }

  private async processPushMessage(
    message: PushWorkerMessage,
    data: NormalizedPushData,
    context: RmqContext,
  ): Promise<void> {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    try {
      const doneKey = REDIS_KEYS.PUSH_JOB_DONE(message.jobId);
      const lockKey = REDIS_KEYS.PUSH_JOB_LOCK(message.jobId);
      const statusKey = REDIS_KEYS.PUSH_JOB_STATUS(message.jobId);
      const retryKey = REDIS_KEYS.PUSH_JOB_RETRY(message.jobId);

      if (await this.redis.get(doneKey)) {
        this.logger.warn(`Skip duplicated push job: ${message.jobId}`);
        channel.ack(originalMessage);
        return;
      }

      const lockAcquired = await this.redis.set(lockKey, this.workerId, {
        NX: true,
        EX: REDIS_TTL_SECONDS.PUSH_JOB_LOCK,
      });

      if (!lockAcquired) {
        this.logger.warn(`Push job is locked, requeue: ${message.jobId}`);
        channel.nack(originalMessage, false, true);
        return;
      }

      await this.redis.set(statusKey, 'processing', {
        EX: REDIS_TTL_SECONDS.PUSH_JOB_STATUS,
      });

      if (data.reserveTime) {
        await this.pushSender.reserve({
          title: data.title,
          body: data.body,
          reserveTime: data.reserveTime,
          target: data.target,
        });
      } else {
        const tokens = await this.pushTokenService.getTokens(data.target);
        await this.pushSender.send(tokens, {
          title: data.title,
          body: data.body,
          channelId: data.channelId,
        });
      }

      await this.redis
        .multi()
        .set(doneKey, 'sent', { EX: REDIS_TTL_SECONDS.PUSH_JOB_DONE })
        .set(statusKey, 'sent', { EX: REDIS_TTL_SECONDS.PUSH_JOB_STATUS })
        .del(lockKey)
        .del(retryKey)
        .exec();

      this.logger.log(`Push processed: ${data.logLabel}, job=${message.jobId}`);
      channel.ack(originalMessage);
    } catch (error) {
      await this.handleFailure(message, error);
      channel.ack(originalMessage);
    }
  }

  private async handleFailure(
    message: PushWorkerMessage,
    error: unknown,
  ): Promise<void> {
    const nextRetryCount = (message.meta.retryCount ?? 0) + 1;
    const lockKey = REDIS_KEYS.PUSH_JOB_LOCK(message.jobId);
    const statusKey = REDIS_KEYS.PUSH_JOB_STATUS(message.jobId);
    const retryKey = REDIS_KEYS.PUSH_JOB_RETRY(message.jobId);

    await this.redis
      .multi()
      .set(statusKey, nextRetryCount > 2 ? 'failed' : 'retrying', {
        EX: REDIS_TTL_SECONDS.PUSH_JOB_STATUS,
      })
      .set(retryKey, nextRetryCount.toString(), {
        EX: REDIS_TTL_SECONDS.PUSH_JOB_RETRY,
      })
      .del(lockKey)
      .exec();

    const retryMessage: PushWorkerMessage = {
      ...message,
      messageId: randomUUID(),
      meta: {
        ...message.meta,
        retryCount: nextRetryCount,
      },
    };

    const isMessagePush =
      message.eventType === RABBITMQ_ROUTING_KEYS.PUSH_MESSAGE_REQUESTED;

    if (nextRetryCount === 1) {
      await this.rabbitMqProducer.publish({
        queue: isMessagePush
          ? RABBITMQ_QUEUES.PUSH_MESSAGE_RETRY_1M
          : RABBITMQ_QUEUES.PUSH_NOTICE_RETRY_1M,
        routingKey: isMessagePush
          ? RABBITMQ_ROUTING_KEYS.PUSH_MESSAGE_RETRY_1M
          : RABBITMQ_ROUTING_KEYS.PUSH_NOTICE_RETRY_1M,
        payload: retryMessage,
      });
    } else if (nextRetryCount === 2) {
      await this.rabbitMqProducer.publish({
        queue: isMessagePush
          ? RABBITMQ_QUEUES.PUSH_MESSAGE_RETRY_5M
          : RABBITMQ_QUEUES.PUSH_NOTICE_RETRY_5M,
        routingKey: isMessagePush
          ? RABBITMQ_ROUTING_KEYS.PUSH_MESSAGE_RETRY_5M
          : RABBITMQ_ROUTING_KEYS.PUSH_NOTICE_RETRY_5M,
        payload: retryMessage,
      });
    } else {
      await this.rabbitMqProducer.publish({
        queue: isMessagePush
          ? RABBITMQ_QUEUES.PUSH_MESSAGE_DLQ
          : RABBITMQ_QUEUES.PUSH_NOTICE_DLQ,
        routingKey: isMessagePush
          ? RABBITMQ_ROUTING_KEYS.PUSH_MESSAGE_FAILED
          : RABBITMQ_ROUTING_KEYS.PUSH_NOTICE_FAILED,
        payload: retryMessage,
      });
    }

    this.logger.error(
      `Push failed: event=${message.eventType}, job=${message.jobId}, retry=${nextRetryCount}`,
      error instanceof Error ? error.stack : String(error),
    );
  }
}
