import { Application } from '@modules/application/domain/entities/application.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';
import { Repository } from 'typeorm';

@Injectable()
export class GetAdminApplicationDetailQuery {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
  ) {}

  async execute(userId: string, retreatId: number): Promise<Application> {
    const application = await this.applicationRepository.findOne({
      where: {
        userId,
        retreatId,
      },
      relations: {
        user: true,
        survey: true,
        applicationMeals: {
          retreatMeal: true,
        },
        applicationTransports: {
          retreatTransport: true,
        },
      },
    });

    if (!application) {
      throw new NotFoundException(ERROR_MESSAGES.APPLICATION_NOT_FOUND);
    }

    return application;
  }
}
