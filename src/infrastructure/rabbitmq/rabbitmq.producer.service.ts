import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AmqpConnectionManager,
  ChannelWrapper,
  connect,
} from 'amqp-connection-manager';
import { ConfirmChannel } from 'amqplib';
import {
  RABBITMQ_EXCHANGE_APP_EVENTS,
  RABBITMQ_EXCHANGE_TYPE,
  RABBITMQ_QUEUES,
  RABBITMQ_RETRY_DELAYS_MS,
  RABBITMQ_ROUTING_KEYS,
} from '@shared/constants/rabbitmq.constants';

@Injectable()
export class RabbitMqProducerService
  implements OnModuleDestroy, OnApplicationShutdown
{
  private readonly logger = new Logger(RabbitMqProducerService.name);
  private connectionManager: AmqpConnectionManager | null = null;
  private channelWrapper: ChannelWrapper | null = null;
  private connectPromise: Promise<ChannelWrapper> | null = null;
  private readonly queueSetupPromises = new Map<string, Promise<void>>();

  constructor(private readonly configService: ConfigService) {}

  async publish(params: {
    queue: string;
    routingKey: string;
    payload: unknown;
  }): Promise<void> {
    const channelWrapper = await this.getChannel();
    await this.ensureQueueSetup(
      channelWrapper,
      params.queue,
      params.routingKey,
    );

    const eventType =
      typeof params.payload === 'object' &&
      params.payload !== null &&
      'eventType' in params.payload
        ? String(params.payload.eventType)
        : params.routingKey;

    const packet = {
      pattern: eventType,
      data: params.payload,
    };

    const ok = await channelWrapper.publish(
      RABBITMQ_EXCHANGE_APP_EVENTS,
      params.routingKey,
      Buffer.from(JSON.stringify(packet)),
    );

    if (!ok) {
      this.logger.warn(
        `RabbitMQ publish buffered: queue=${params.queue}, routingKey=${params.routingKey}`,
      );
    }
  }

  private async getChannel(): Promise<ChannelWrapper> {
    if (this.channelWrapper) {
      return this.channelWrapper;
    }

    if (!this.connectPromise) {
      this.connectPromise = Promise.resolve(this.connectChannelWrapper());
    }

    return this.connectPromise;
  }

  private connectChannelWrapper(): ChannelWrapper {
    const rabbitMqUrl =
      this.configService.get<string>('RABBITMQ_URL') ?? 'amqp://localhost:5672';

    const connectionManager = connect([rabbitMqUrl]);
    this.connectionManager = connectionManager;

    connectionManager.on('connect', ({ url }) => {
      this.logger.log(`RabbitMQ producer connected: ${url ?? rabbitMqUrl}`);
    });

    connectionManager.on('disconnect', ({ err }) => {
      this.logger.error('RabbitMQ producer disconnected', err);
      this.connectionManager = null;
      this.channelWrapper = null;
      this.connectPromise = null;
      this.queueSetupPromises.clear();
    });

    const channelWrapper = connectionManager.createChannel({
      setup: async (channel: ConfirmChannel) => {
        await channel.assertExchange(
          RABBITMQ_EXCHANGE_APP_EVENTS,
          RABBITMQ_EXCHANGE_TYPE,
          { durable: true },
        );
      },
    });

    this.channelWrapper = channelWrapper;
    return channelWrapper;
  }

  private async ensureQueueSetup(
    channelWrapper: ChannelWrapper,
    queue: string,
    routingKey: string,
  ): Promise<void> {
    const setupKey = `${queue}:${routingKey}`;
    const existing = this.queueSetupPromises.get(setupKey);
    if (existing) {
      await existing;
      return;
    }

    const setupPromise = channelWrapper.addSetup(async (channel) => {
      await channel.assertQueue(queue, this.getQueueOptions(queue));
      await channel.bindQueue(queue, RABBITMQ_EXCHANGE_APP_EVENTS, routingKey);
    });

    this.queueSetupPromises.set(setupKey, setupPromise);
    await setupPromise;
  }

  private getQueueOptions(queue: string) {
    const retryQueueOptions: Record<
      string,
      { ttl: number; deadLetterRoutingKey: string }
    > = {
      [RABBITMQ_QUEUES.EMAIL_VERIFICATION_RETRY_1M]: {
        ttl: RABBITMQ_RETRY_DELAYS_MS.EMAIL_VERIFICATION_RETRY_1M,
        deadLetterRoutingKey: RABBITMQ_ROUTING_KEYS.EMAIL_VERIFICATION_REQUESTED,
      },
      [RABBITMQ_QUEUES.EMAIL_VERIFICATION_RETRY_5M]: {
        ttl: RABBITMQ_RETRY_DELAYS_MS.EMAIL_VERIFICATION_RETRY_5M,
        deadLetterRoutingKey: RABBITMQ_ROUTING_KEYS.EMAIL_VERIFICATION_REQUESTED,
      },
      [RABBITMQ_QUEUES.PUSH_NOTICE_RETRY_1M]: {
        ttl: RABBITMQ_RETRY_DELAYS_MS.PUSH_NOTICE_RETRY_1M,
        deadLetterRoutingKey: RABBITMQ_ROUTING_KEYS.PUSH_NOTICE_REQUESTED,
      },
      [RABBITMQ_QUEUES.PUSH_NOTICE_RETRY_5M]: {
        ttl: RABBITMQ_RETRY_DELAYS_MS.PUSH_NOTICE_RETRY_5M,
        deadLetterRoutingKey: RABBITMQ_ROUTING_KEYS.PUSH_NOTICE_REQUESTED,
      },
      [RABBITMQ_QUEUES.PUSH_MESSAGE_RETRY_1M]: {
        ttl: RABBITMQ_RETRY_DELAYS_MS.PUSH_MESSAGE_RETRY_1M,
        deadLetterRoutingKey: RABBITMQ_ROUTING_KEYS.PUSH_MESSAGE_REQUESTED,
      },
      [RABBITMQ_QUEUES.PUSH_MESSAGE_RETRY_5M]: {
        ttl: RABBITMQ_RETRY_DELAYS_MS.PUSH_MESSAGE_RETRY_5M,
        deadLetterRoutingKey: RABBITMQ_ROUTING_KEYS.PUSH_MESSAGE_REQUESTED,
      },
    };

    const retryOptions = retryQueueOptions[queue];
    if (retryOptions) {
      return {
        durable: true,
        arguments: {
          'x-message-ttl': retryOptions.ttl,
          'x-dead-letter-exchange': RABBITMQ_EXCHANGE_APP_EVENTS,
          'x-dead-letter-routing-key': retryOptions.deadLetterRoutingKey,
        },
      };
    }

    return { durable: true };
  }

  async onModuleDestroy(): Promise<void> {
    await this.close();
  }

  async onApplicationShutdown(): Promise<void> {
    await this.close();
  }

  private async close(): Promise<void> {
    if (this.channelWrapper) {
      await this.channelWrapper.close();
      this.channelWrapper = null;
    }

    if (this.connectionManager) {
      await this.connectionManager.close();
      this.connectionManager = null;
    }

    this.connectPromise = null;
    this.queueSetupPromises.clear();
  }
}
