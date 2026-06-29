import { Application } from '@modules/application/domain/entities/application.entity';
import { ApplicationStatus } from '@modules/application/domain/enum/application.enum';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';

@Injectable()
export class GetMyApplicationHistoryQuery {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
  ) {}

  async execute(userId: string): Promise<number[]> {
    const applications = await this.applicationRepository.find({
      where: { userId, status: Not(ApplicationStatus.CANCELED) },
      select: ['retreatId'],
      order: { createdAt: 'ASC' },
    });

    return applications.map((application) => application.retreatId);
  }
}
