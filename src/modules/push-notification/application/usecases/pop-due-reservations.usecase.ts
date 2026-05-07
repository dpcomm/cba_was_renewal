import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';
import { ReservationResult } from '../ports/push-sender.port';
import {
  REDIS_CLIENT_TOKEN,
  REDIS_KEYS,
} from '@shared/constants/redis.constants';

@Injectable()
export class PopDueReservationsUseCase {
  constructor(
    @Inject(REDIS_CLIENT_TOKEN) private readonly redis: RedisClientType,
  ) {}

  private parseReservationId(member: string): number {
    return Number(member.split(':').at(-1));
  }

  async execute(nowMs: number): Promise<ReservationResult[]> {
    const members = await this.redis.zRangeByScore(
      REDIS_KEYS.PUSH_RESERVATION_ZSET,
      0,
      nowMs,
    );

    if (members.length === 0) return [];

    const results: ReservationResult[] = [];

    for (const member of members) {
      const id = this.parseReservationId(member);
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

    const dataKeys = members.map((member) =>
      REDIS_KEYS.PUSH_RESERVATION_DATA(this.parseReservationId(member)),
    );

    await this.redis
      .multi()
      .zRem(REDIS_KEYS.PUSH_RESERVATION_ZSET, members)
      .del(dataKeys)
      .exec();

    return results;
  }
}
