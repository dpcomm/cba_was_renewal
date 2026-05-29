import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';
import { ReservationData, ReservationResult } from '../ports/push-sender.port';
import {
  REDIS_CLIENT_TOKEN,
  REDIS_KEYS,
} from '@shared/constants/redis.constants';

@Injectable()
export class ReservePushUseCase {
  constructor(
    @Inject(REDIS_CLIENT_TOKEN) private readonly redis: RedisClientType,
  ) {}

  async execute(dto: ReservationData): Promise<ReservationResult> {
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
      target: dto.target,
      reserveTime: dto.reserveTime,
    };
  }
}
