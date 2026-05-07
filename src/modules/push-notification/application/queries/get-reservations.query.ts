import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';
import { ReservationResult } from '../ports/push-sender.port';
import {
  REDIS_CLIENT_TOKEN,
  REDIS_KEYS,
} from '@shared/constants/redis.constants';

@Injectable()
export class GetReservationsQuery {
  constructor(
    @Inject(REDIS_CLIENT_TOKEN) private readonly redis: RedisClientType,
  ) {}

  private parseReservationId(member: string): number {
    return Number(member.split(':').at(-1));
  }

  async execute(): Promise<ReservationResult[]> {
    const items = await this.redis.zRangeWithScores(
      REDIS_KEYS.PUSH_RESERVATION_ZSET,
      0,
      -1,
    );

    const results: ReservationResult[] = [];

    for (const item of items) {
      const id = this.parseReservationId(item.value);
      const data = await this.redis.hGetAll(
        REDIS_KEYS.PUSH_RESERVATION_DATA(id),
      );

      if (!data || !data.title) continue;

      results.push({
        id,
        title: data.title,
        body: data.body,
        target: data.target ? JSON.parse(data.target) : undefined,
        reserveTime: data.reserveTime,
      });
    }

    return results;
  }
}
