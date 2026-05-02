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

  /** 예약 발송 등록 */
  reserve(data: ReservationData): Promise<ReservationResult>;

  /** 예약 목록 조회 */
  getReservations(): Promise<ReservationResult[]>;

  /** 예약 취소 */
  cancelReservation(reservationId: number): Promise<ReservationResult>;

  /** 시간이 도래한 예약들을 꺼내고 삭제 */
  popDueReservations(nowMs: number): Promise<ReservationResult[]>;
}
