export const RABBITMQ_EXCHANGE_APP_EVENTS = 'app.events';
export const RABBITMQ_EXCHANGE_TYPE = 'topic';

export const RABBITMQ_QUEUES = {
  EMAIL_VERIFICATION_REQUESTED: 'email.verification.requested',
  EMAIL_VERIFICATION_RETRY_1M: 'email.verification.retry.1m',
  EMAIL_VERIFICATION_RETRY_5M: 'email.verification.retry.5m',
  EMAIL_VERIFICATION_DLQ: 'email.verification.dlq',
  PUSH_REQUESTED: 'push.requested',
  PUSH_NOTICE_RETRY_1M: 'push.notice.retry.1m',
  PUSH_NOTICE_RETRY_5M: 'push.notice.retry.5m',
  PUSH_NOTICE_DLQ: 'push.notice.dlq',
  PUSH_MESSAGE_RETRY_1M: 'push.message.retry.1m',
  PUSH_MESSAGE_RETRY_5M: 'push.message.retry.5m',
  PUSH_MESSAGE_DLQ: 'push.message.dlq',
} as const;

export const RABBITMQ_ROUTING_KEYS = {
  EMAIL_VERIFICATION_REQUESTED: 'email.verification.requested',
  EMAIL_VERIFICATION_RETRY_1M: 'email.verification.retry.1m',
  EMAIL_VERIFICATION_RETRY_5M: 'email.verification.retry.5m',
  EMAIL_VERIFICATION_FAILED: 'email.verification.failed',
  PUSH_NOTICE_REQUESTED: 'push.notice.requested',
  PUSH_MESSAGE_REQUESTED: 'push.message.requested',
  PUSH_NOTICE_RETRY_1M: 'push.notice.retry.1m',
  PUSH_NOTICE_RETRY_5M: 'push.notice.retry.5m',
  PUSH_NOTICE_FAILED: 'push.notice.failed',
  PUSH_MESSAGE_RETRY_1M: 'push.message.retry.1m',
  PUSH_MESSAGE_RETRY_5M: 'push.message.retry.5m',
  PUSH_MESSAGE_FAILED: 'push.message.failed',
} as const;

export const RABBITMQ_RETRY_DELAYS_MS = {
  EMAIL_VERIFICATION_RETRY_1M: 60_000,
  EMAIL_VERIFICATION_RETRY_5M: 300_000,
  PUSH_NOTICE_RETRY_1M: 60_000,
  PUSH_NOTICE_RETRY_5M: 300_000,
  PUSH_MESSAGE_RETRY_1M: 60_000,
  PUSH_MESSAGE_RETRY_5M: 300_000,
} as const;
