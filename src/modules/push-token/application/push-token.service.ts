import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { PushToken } from '@modules/push-token/domain/entities/push-token.entity';
import { User } from '@modules/user/domain/entities/user.entity';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';

@Injectable()
export class PushTokenService {
  constructor(
    @InjectRepository(PushToken)
    private pushTokenRepository: Repository<PushToken>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async registToken(userId: number, token: string): Promise<PushToken> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    // 1. 이미 등록된 토큰인지 확인
    const existingToken = await this.pushTokenRepository.findOne({
      where: { token },
      relations: ['user'],
    });

    // 2. 이미 있으면 user교체, lastUsedAt 갱신
    if (existingToken) {
      if (existingToken.userId !== user.id) {
        existingToken.user = user;
      }

      existingToken.lastUsedAt = new Date();
      return await this.pushTokenRepository.save(existingToken);
    }

    // 3. 없으면 신규 등록
    const newToken = this.pushTokenRepository.create({
      token,
      provider: 'expo',
      user,
      lastUsedAt: new Date(),
    });

    return await this.pushTokenRepository.save(newToken);
  }

  async deleteToken(token: string): Promise<void> {
    await this.pushTokenRepository.delete({ token });
  }

  async getTokens(userIds?: number | number[]): Promise<PushToken[]> {
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

  async deleteInvalidTokens(tokens: string[]): Promise<void> {
    if (!tokens || tokens.length === 0) {
      return;
    }

    await this.pushTokenRepository.delete(tokens.map((t) => ({ token: t })));
  }
}
