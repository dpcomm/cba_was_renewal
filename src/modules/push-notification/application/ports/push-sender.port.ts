/**
 * 푸시 알림 발송을 위한 인프라스트럭처 포트 (DIP)
 *
 * Application 계층은 이 인터페이스만 바라보고,
 * 실제 구현체(Expo, FCM 등)는 infrastructure 계층에서 주입합니다.
 */
export const PUSH_SENDER_PORT = Symbol('PUSH_SENDER_PORT');

export interface PushToken {
  token: string;
}

export interface PushMessage {
  title: string;
  body: string;
  channelId: string;
}

export interface ReservationData {
  title: string;
  body: string;
  reserveTime: string;
  target?: number[];
}

export interface ReservationResult {
  id: number;
  title: string;
  body: string;
  target?: number[];
  reserveTime: string;
}

export interface IPushSenderPort {
  /** 즉시 발송 */
  send(
    tokens: PushToken[],
    message: PushMessage,
    data?: Record<string, any>,
  ): Promise<void>;
}
