import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';
import { ReservationResult } from '../ports/push-sender.port';
import {
  REDIS_CLIENT_TOKEN,
  REDIS_KEYS,
} from '@shared/constants/redis.constants';

@Injectable()
export class CancelReservationUseCase {
  constructor(
    @Inject(REDIS_CLIENT_TOKEN) private readonly redis: RedisClientType,
  ) {}

  async execute(reservationId: number): Promise<ReservationResult> {
    const dataKey = REDIS_KEYS.PUSH_RESERVATION_DATA(reservationId);
    const member = REDIS_KEYS.PUSH_RESERVATION_MEMBER(reservationId);
    const data = await this.redis.hGetAll(dataKey);

    if (!data || !data.title) {
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
      target: data.target ? JSON.parse(data.target) : undefined,
      reserveTime: data.reserveTime,
    };
  }
}
