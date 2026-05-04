export const RABBITMQ_EXCHANGE_APP_EVENTS = 'app.events';
export const RABBITMQ_EXCHANGE_TYPE = 'topic';

export const RABBITMQ_QUEUES = {
  EMAIL_VERIFICATION_REQUESTED: 'email.verification.requested',
  PUSH_NOTICE_REQUESTED: 'push.notice.requested',
} as const;

export const RABBITMQ_ROUTING_KEYS = {
  EMAIL_VERIFICATION_REQUESTED: 'email.verification.requested',
  PUSH_NOTICE_REQUESTED: 'push.notice.requested',
} as const;
