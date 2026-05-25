import { Application } from '@modules/application/domain/entities/application.entity';
import {
  ApplicationStatus,
  PaymentStatus,
} from '@modules/application/domain/enum/application.enum';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';
import { Repository } from 'typeorm';

export interface ScanApplicationResult {
  userId: string;
  name: string;
  phone: string;
  group: string;
  paymentStatus: PaymentStatus;
  status: ApplicationStatus;
  checkedInAt: Date | null;
}

@Injectable()
export class ScanApplicationQuery {
  private readonly logger = new Logger(ScanApplicationQuery.name);

  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
  ) {}

  async execute(
    userId: string,
    retreatId: number,
  ): Promise<ScanApplicationResult> {
    const application = await this.applicationRepository.findOne({
      where: { userId, retreatId },
      relations: ['user'],
      select: {
        id: true,
        userId: true,
        paymentStatus: true,
        status: true,
        checkedInAt: true,
        user: {
          name: true,
          phone: true,
          group: true,
        },
      },
    });

    if (!application) {
      throw new NotFoundException(ERROR_MESSAGES.APPLICATION_NOT_FOUND);
    }

    this.logger.log(
      `QR 스캔 조회: ${application.user.name}(${application.userId}) - 결과: ${application.paymentStatus === PaymentStatus.PAID ? '입금완료' : '미입금'}, ${application.status === ApplicationStatus.CHECKED_IN ? '체크인완료' : '미체크인'}`,
    );

    return {
      userId: application.userId,
      name: application.user.name,
      phone: application.user.phone,
      group: application.user.group,
      paymentStatus: application.paymentStatus,
      status: application.status,
      checkedInAt: application.checkedInAt,
    };
  }
}
