import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';

@Injectable()
export class GetUserQuery {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private async findOneBy(where: FindOptionsWhere<User>): Promise<User> {
    const user = await this.userRepository.findOne({ where });
    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }
    return user;
  }

  async byId(id: number): Promise<User> {
    return this.findOneBy({ id });
  }

  async byUserId(userId: string): Promise<User> {
    return this.findOneBy({ userId });
  }

  async byEmail(email: string): Promise<User> {
    return this.findOneBy({ email });
  }
}
