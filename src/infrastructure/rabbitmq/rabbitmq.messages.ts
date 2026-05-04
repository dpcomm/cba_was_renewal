export interface EmailVerificationRequestedMessage {
  email: string;
  code: string;
  verificationType: string;
  requestedAt: string;
}

export interface PushNoticeRequestedMessage {
  noticeId: number;
  title: string;
  body: string;
  target?: number[];
  reserveTime?: string;
  includeBody: boolean;
  requestedAt: string;
}
