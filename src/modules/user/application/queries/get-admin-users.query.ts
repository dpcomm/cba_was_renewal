import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class GetAdminUsersQuery {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async execute(query: {
    search?: string;
    page?: number;
    limit?: number;
    includeDeleted?: boolean;
  }): Promise<{ items: User[]; total: number }> {
    const { search, page = 1, limit = 20, includeDeleted = false } = query;

    const qb = this.userRepository.createQueryBuilder('user');

    if (!includeDeleted) {
      qb.andWhere('user.isDeleted = :isDeleted', { isDeleted: false });
    }

    if (search && search.trim()) {
      qb.andWhere(
        '(user.name LIKE :search OR user.userId LIKE :search OR user.group LIKE :search OR user.phone LIKE :search)',
        { search: `%${search.trim()}%` },
      );
    }

    qb.orderBy('user.id', 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }
}
