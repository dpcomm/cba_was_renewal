import { Application } from '@modules/application/domain/entities/application.entity';
import {
  ApplicationStatus,
  PaymentStatus,
} from '@modules/application/domain/enum/application.enum';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';
import { Not, Repository } from 'typeorm';

@Injectable()
export class CheckMyApplicationPaidQuery {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
  ) {}

  async execute(userId: string, retreatId: number): Promise<boolean> {
    const application = await this.applicationRepository.findOne({
      where: {
        userId: userId,
        retreatId: retreatId,
        status: Not(ApplicationStatus.CANCELED),
      },
      select: ['paymentStatus'],
    });

    if (!application) {
      throw new NotFoundException(ERROR_MESSAGES.APPLICATION_NOT_FOUND);
    }

    return application.paymentStatus === PaymentStatus.PAID;
  }
}
