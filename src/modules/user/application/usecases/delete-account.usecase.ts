import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { GetUserQuery } from '../queries/get-user.query';

@Injectable()
export class DeleteAccountUseCase {
  private readonly logger = new Logger(DeleteAccountUseCase.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly getUserQuery: GetUserQuery,
  ) {}

  async execute(userId: number): Promise<void> {
    const user = await this.getUserQuery.byId(userId);
    user.softDelete();
    await this.userRepository.save(user);
    this.logger.warn(`회원 탈퇴(Soft Delete): ${user.name}(${user.id})`);
  }
}
