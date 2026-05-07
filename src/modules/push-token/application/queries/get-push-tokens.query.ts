import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { PushToken } from '@modules/push-token/domain/entities/push-token.entity';

@Injectable()
export class GetPushTokensQuery {
  constructor(
    @InjectRepository(PushToken)
    private pushTokenRepository: Repository<PushToken>,
  ) {}

  async execute(userIds?: number | number[]): Promise<PushToken[]> {
    if (userIds == null) {
      return this.pushTokenRepository.find();
    }

    const ids = Array.isArray(userIds) ? userIds : [userIds];

    if (ids.length === 0) {
      return [];
    }

    return this.pushTokenRepository.find({
      where: { userId: In(ids) },
    });
  }
}
