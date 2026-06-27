import { Application } from '@modules/application/domain/entities/application.entity';
import { ApplicationStatus } from '@modules/application/domain/enum/application.enum';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';
import { Not, Repository } from 'typeorm';

@Injectable()
export class GetMyApplicationDetailQuery {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
  ) {}

  async execute(userId: string, retreatId: number): Promise<Application> {
    const application = await this.applicationRepository.findOne({
      where: { userId, retreatId, status: Not(ApplicationStatus.CANCELED) },
      relations: [
        'applicationMeals',
        'applicationMeals.retreatMeal',
        'applicationTransports',
        'applicationTransports.retreatTransport',
        'answers',
        'answers.question',
        'answers.questionOption',
      ],
    });

    if (!application) {
      throw new NotFoundException(ERROR_MESSAGES.APPLICATION_NOT_FOUND);
    }

    return application;
  }
}
