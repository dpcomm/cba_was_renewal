import { RABBITMQ_ROUTING_KEYS } from '@shared/constants/rabbitmq.constants';

export interface MessageEnvelope<TData, TType extends string = string> {
  messageId: string;
  jobId: string;
  eventType: TType;
  occurredAt: string;
  producer: string;
  version: number;
  data: TData;
  meta: {
    retryCount: number;
    traceId?: string;
    requestedByUserId?: number;
  };
}

export interface EmailVerificationRequestedPayload {
  email: string;
  code: string;
  verificationType: string;
}

export type EmailVerificationRequestedMessage = MessageEnvelope<
  EmailVerificationRequestedPayload,
  typeof RABBITMQ_ROUTING_KEYS.EMAIL_VERIFICATION_REQUESTED
>;

export interface PushNoticeRequestedPayload {
  noticeId: number;
  title: string;
  body: string;
  target?: number[];
  reserveTime?: string;
  includeBody: boolean;
}

export type PushNoticeRequestedMessage = MessageEnvelope<
  PushNoticeRequestedPayload,
  typeof RABBITMQ_ROUTING_KEYS.PUSH_NOTICE_REQUESTED
>;

export interface PushMessageRequestedPayload {
  title: string;
  body: string;
  target?: number[];
  channelId: string;
  reserveTime?: string;
}

export type PushMessageRequestedMessage = MessageEnvelope<
  PushMessageRequestedPayload,
  typeof RABBITMQ_ROUTING_KEYS.PUSH_MESSAGE_REQUESTED
>;
