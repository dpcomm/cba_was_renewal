import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PushToken } from '@modules/push-token/domain/entities/push-token.entity';

@Injectable()
export class DeleteInvalidPushTokensUseCase {
  constructor(
    @InjectRepository(PushToken)
    private pushTokenRepository: Repository<PushToken>,
  ) {}

  async execute(tokens: string[]): Promise<void> {
    if (!tokens || tokens.length === 0) {
      return;
    }

    await this.pushTokenRepository.delete(tokens.map((t) => ({ token: t })));
  }
}
