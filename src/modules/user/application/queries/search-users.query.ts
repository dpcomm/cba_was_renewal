import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';

@Injectable()
export class SearchUsersQuery {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async searchByName(name: string): Promise<User[]> {
    if (!name.trim()) return [];
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.name LIKE :name', { name: `%${name}%` })
      .andWhere('user.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy('user.name', 'ASC')
      .addOrderBy('user.id', 'ASC')
      .take(20)
      .getMany();
  }

  async findByNameAndPhone(name: string, phone: string): Promise<User[]> {
    const users = await this.userRepository.find({ where: { name, phone } });
    if (!users || users.length === 0) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }
    return users;
  }
}
