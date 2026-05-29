import { RmqOptions, Transport } from '@nestjs/microservices';
import { RABBITMQ_QUEUES } from '@shared/constants/rabbitmq.constants';

export const createRabbitMqWorkerOptions = (queue: string): RmqOptions => ({
  transport: Transport.RMQ,
  options: {
    urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
    queue,
    noAck: false,
    prefetchCount: 5,
    queueOptions: {
      durable: true,
    },
  },
});

export const EMAIL_WORKER_RMQ_OPTIONS = createRabbitMqWorkerOptions(
  RABBITMQ_QUEUES.EMAIL_VERIFICATION_REQUESTED,
);

export const PUSH_WORKER_RMQ_OPTIONS = createRabbitMqWorkerOptions(
  RABBITMQ_QUEUES.PUSH_REQUESTED,
);
