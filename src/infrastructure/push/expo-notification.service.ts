import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { RedisClientType } from 'redis';
import {
  IPushSenderPort,
  PushToken,
  PushMessage,
  ReservationData,
  ReservationResult,
} from '@modules/push-notification/application/ports/push-sender.port';
import {
  REDIS_CLIENT_TOKEN,
  REDIS_KEYS,
} from '@shared/constants/redis.constants';

@Injectable()
export class ExpoNotificationService implements IPushSenderPort {
  private expo: Expo;
  private readonly logger = new Logger(ExpoNotificationService.name);

  constructor(
    @Inject(REDIS_CLIENT_TOKEN) private readonly redis: RedisClientType,
  ) {
    this.expo = new Expo();
  }

  private parseReservationId(member: string): number {
    return Number(member.split(':').at(-1));
  }

  async send(
    tokens: PushToken[],
    message: PushMessage,
    data?: Record<string, any>,
  ): Promise<void> {
    const messages: ExpoPushMessage[] = [];

    for (const tokenEntity of tokens) {
      const token = tokenEntity.token;

      if (!Expo.isExpoPushToken(token)) {
        this.logger.warn(`유효하지 않은 Expo 푸시 토큰: ${token as string}`);
        continue;
      }

      messages.push({
        to: token,
        sound: 'default',
        title: message.title,
        body: message.body,
        channelId: message.channelId,
        data,
      });
    }

    const chunks = this.expo.chunkPushNotifications(messages);
    const tickets: ExpoPushTicket[] = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        this.logger.error('Expo 푸시 전송 에러:', error);
      }
    }
  }

  // Push Reservation
  // push 스케줄 관리는 redis를 활용
  // push send의 실행은 일정 주기별 cron에서 동작
  // scheduler의 관리는 ZSet를 이용
  // - push:reservation:zset
  // -   score = reserveTime (timestamp, ms)
  // -   member = push:reservation:{id}
  // push 정보 저장은 hash를 이용
  // - push:reservation:data:{id}
  // -   title
  // -   body
  // -   target
  // -   reserveTime

  async reserve(dto: ReservationData): Promise<ReservationResult> {
    // ID 발급 (간단 & 충돌 없음)
    const id = await this.redis.incr(REDIS_KEYS.PUSH_RESERVATION_ID_SEQUENCE);

    const reserveTimeMs = new Date(dto.reserveTime).getTime();
    const dataKey = REDIS_KEYS.PUSH_RESERVATION_DATA(id);
    const member = REDIS_KEYS.PUSH_RESERVATION_MEMBER(id);

    await this.redis
      .multi()
      .hSet(dataKey, {
        title: dto.title,
        body: dto.body,
        reserveTime: dto.reserveTime,
        target: dto.target ? JSON.stringify(dto.target) : '',
      })
      .zAdd(REDIS_KEYS.PUSH_RESERVATION_ZSET, {
        score: reserveTimeMs,
        value: member,
      })
      .exec();

    return {
      id,
      title: dto.title,
      body: dto.body,
      reserveTime: dto.reserveTime,
    };
  }

  async getReservations(): Promise<ReservationResult[]> {
    const items = await this.redis.zRangeWithScores(
      REDIS_KEYS.PUSH_RESERVATION_ZSET,
      0,
      -1,
    );

    const results: ReservationResult[] = [];

    for (const item of items) {
      const member = item.value; // push:reservation:{id}
      const id = this.parseReservationId(member);
      const dataKey = REDIS_KEYS.PUSH_RESERVATION_DATA(id);

      const data = await this.redis.hGetAll(dataKey);
      if (!data || !data.title) continue;

      results.push({
        id,
        title: data.title,
        body: data.body,
        target: data.target ? JSON.parse(data.target) : null,
        reserveTime: data.reserveTime,
      });
    }

    return results;
  }

  async cancelReservation(reservationId: number): Promise<ReservationResult> {
    const dataKey = REDIS_KEYS.PUSH_RESERVATION_DATA(reservationId);
    const member = REDIS_KEYS.PUSH_RESERVATION_MEMBER(reservationId);

    const data = await this.redis.hGetAll(dataKey);
    if (!data || !data.title) {
      // 멱등성 보장 (이미 없으면 그냥 반환)
      return {
        id: reservationId,
        title: '',
        body: '',
        reserveTime: '',
      };
    }

    await this.redis
      .multi()
      .zRem(REDIS_KEYS.PUSH_RESERVATION_ZSET, member)
      .del(dataKey)
      .exec();

    return {
      id: reservationId,
      title: data.title,
      body: data.body,
      reserveTime: data.reserveTime,
    };
  }

  async popDueReservations(nowMs: number): Promise<ReservationResult[]> {
    // 실행 대상 조회
    const members = await this.redis.zRangeByScore(
      REDIS_KEYS.PUSH_RESERVATION_ZSET,
      0,
      nowMs,
    );

    if (members.length === 0) return [];

    const results: ReservationResult[] = [];

    for (const member of members) {
      const id = this.parseReservationId(member);
      const dataKey = REDIS_KEYS.PUSH_RESERVATION_DATA(id);

      const data = await this.redis.hGetAll(dataKey);
      if (!data || !data.title) continue;

      results.push({
        id,
        title: data.title,
        body: data.body,
        target: data.target ? JSON.parse(data.target) : null,
        reserveTime: data.reserveTime,
      });
    }

    const dataKeys = members.map((m) =>
      REDIS_KEYS.PUSH_RESERVATION_DATA(this.parseReservationId(m)),
    );

    // 실행된 예약 제거
    await this.redis
      .multi()
      .zRem(REDIS_KEYS.PUSH_RESERVATION_ZSET, members)
      .del(dataKeys)
      .exec();

    return results;
  }
}
