import { Application } from '@modules/application/domain/entities/application.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CheckMyApplicationQuery {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
  ) {}

  async execute(userId: string, retreatId: number): Promise<boolean> {
    const application = await this.applicationRepository.findOne({
      where: {
        userId: userId,
        retreatId: retreatId,
      },
      select: ['id'],
    });

    return !!application;
  }
}
