import { Controller, Inject, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { RedisClientType } from 'redis';
import { MailService } from '@infrastructure/mail/mail.service';
import { RabbitMqProducerService } from '@infrastructure/rabbitmq/rabbitmq.producer.service';
import {
  REDIS_CLIENT_TOKEN,
  REDIS_KEYS,
  REDIS_TTL_SECONDS,
} from '@shared/constants/redis.constants';
import {
  RABBITMQ_QUEUES,
  RABBITMQ_ROUTING_KEYS,
} from '@shared/constants/rabbitmq.constants';
import { EmailVerificationRequestedMessage } from '@infrastructure/rabbitmq/rabbitmq.messages';

@Controller()
export class EmailVerificationWorkerController {
  private readonly logger = new Logger(EmailVerificationWorkerController.name);
  private readonly workerId = `email-worker:${process.pid}`;

  constructor(
    private readonly mailService: MailService,
    private readonly rabbitMqProducer: RabbitMqProducerService,
    @Inject(REDIS_CLIENT_TOKEN) private readonly redis: RedisClientType,
  ) {}

  @EventPattern(RABBITMQ_ROUTING_KEYS.EMAIL_VERIFICATION_REQUESTED)
  async handleEmailVerificationRequested(
    @Payload() message: EmailVerificationRequestedMessage,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    try {
      const doneKey = REDIS_KEYS.EMAIL_JOB_DONE(message.jobId);
      const lockKey = REDIS_KEYS.EMAIL_JOB_LOCK(message.jobId);
      const statusKey = REDIS_KEYS.EMAIL_JOB_STATUS(message.jobId);
      const retryKey = REDIS_KEYS.EMAIL_JOB_RETRY(message.jobId);

      if (await this.redis.get(doneKey)) {
        this.logger.warn(`Skip duplicated email job: ${message.jobId}`);
        channel.ack(originalMessage);
        return;
      }

      const lockAcquired = await this.redis.set(lockKey, this.workerId, {
        NX: true,
        EX: REDIS_TTL_SECONDS.EMAIL_JOB_LOCK,
      });

      if (!lockAcquired) {
        this.logger.warn(`Email job is locked, requeue: ${message.jobId}`);
        channel.nack(originalMessage, false, true);
        return;
      }

      await this.redis.set(statusKey, 'processing', {
        EX: REDIS_TTL_SECONDS.EMAIL_JOB_STATUS,
      });

      await this.mailService.sendVerificationEmail(
        message.data.email,
        message.data.code,
      );

      await this.redis
        .multi()
        .set(doneKey, 'sent', { EX: REDIS_TTL_SECONDS.EMAIL_JOB_DONE })
        .set(statusKey, 'sent', { EX: REDIS_TTL_SECONDS.EMAIL_JOB_STATUS })
        .del(lockKey)
        .del(retryKey)
        .exec();

      this.logger.log(
        `Email verification sent: email=${message.data.email}, job=${message.jobId}`,
      );
      channel.ack(originalMessage);
    } catch (error) {
      await this.handleFailure(message, error);
      channel.ack(originalMessage);
    }
  }

  private async handleFailure(
    message: EmailVerificationRequestedMessage,
    error: unknown,
  ): Promise<void> {
    const nextRetryCount = (message.meta.retryCount ?? 0) + 1;
    const lockKey = REDIS_KEYS.EMAIL_JOB_LOCK(message.jobId);
    const statusKey = REDIS_KEYS.EMAIL_JOB_STATUS(message.jobId);
    const retryKey = REDIS_KEYS.EMAIL_JOB_RETRY(message.jobId);

    await this.redis
      .multi()
      .set(statusKey, nextRetryCount > 2 ? 'failed' : 'retrying', {
        EX: REDIS_TTL_SECONDS.EMAIL_JOB_STATUS,
      })
      .set(retryKey, nextRetryCount.toString(), {
        EX: REDIS_TTL_SECONDS.EMAIL_JOB_RETRY,
      })
      .del(lockKey)
      .exec();

    const retryMessage: EmailVerificationRequestedMessage = {
      ...message,
      messageId: randomUUID(),
      meta: {
        ...message.meta,
        retryCount: nextRetryCount,
      },
    };

    if (nextRetryCount === 1) {
      await this.rabbitMqProducer.publish({
        queue: RABBITMQ_QUEUES.EMAIL_VERIFICATION_RETRY_1M,
        routingKey: RABBITMQ_ROUTING_KEYS.EMAIL_VERIFICATION_RETRY_1M,
        payload: retryMessage,
      });
    } else if (nextRetryCount === 2) {
      await this.rabbitMqProducer.publish({
        queue: RABBITMQ_QUEUES.EMAIL_VERIFICATION_RETRY_5M,
        routingKey: RABBITMQ_ROUTING_KEYS.EMAIL_VERIFICATION_RETRY_5M,
        payload: retryMessage,
      });
    } else {
      await this.rabbitMqProducer.publish({
        queue: RABBITMQ_QUEUES.EMAIL_VERIFICATION_DLQ,
        routingKey: RABBITMQ_ROUTING_KEYS.EMAIL_VERIFICATION_FAILED,
        payload: retryMessage,
      });
    }

    this.logger.error(
      `Email verification failed: job=${message.jobId}, retry=${nextRetryCount}`,
      error instanceof Error ? error.stack : String(error),
    );
  }
}
