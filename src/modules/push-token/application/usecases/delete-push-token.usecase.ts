import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PushToken } from '@modules/push-token/domain/entities/push-token.entity';

@Injectable()
export class DeletePushTokenUseCase {
  constructor(
    @InjectRepository(PushToken)
    private pushTokenRepository: Repository<PushToken>,
  ) {}

  async execute(token: string): Promise<void> {
    await this.pushTokenRepository.delete({ token });
  }
}
