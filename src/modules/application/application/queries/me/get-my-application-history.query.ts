import { Application } from '@modules/application/domain/entities/application.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class GetMyApplicationHistoryQuery {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
  ) {}

  async execute(userId: string): Promise<number[]> {
    const applications = await this.applicationRepository.find({
      where: { userId },
      select: ['retreatId'],
      order: { createdAt: 'ASC' },
    });

    return applications.map((application) => application.retreatId);
  }
}
