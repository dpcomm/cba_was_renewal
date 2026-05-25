import { Application } from '@modules/application/domain/entities/application.entity';
import { ApplicationStatus } from '@modules/application/domain/enum/application.enum';
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';
import { Repository } from 'typeorm';

@Injectable()
export class CheckInApplicationUseCase {
  private readonly logger = new Logger(CheckInApplicationUseCase.name);

  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
  ) {}

  async execute(
    targetUserId: string,
    retreatId: number,
    adminUserId: string,
  ): Promise<{ checkedInAt: Date }> {
    const application = await this.applicationRepository.findOne({
      where: { userId: targetUserId, retreatId },
      relations: ['user'],
      select: {
        id: true,
        checkedInAt: true,
        user: {
          name: true,
        },
      },
    });

    if (!application) {
      throw new NotFoundException(ERROR_MESSAGES.APPLICATION_NOT_FOUND);
    }

    if (application.checkedInAt) {
      throw new ConflictException('이미 체크인된 사용자입니다.');
    }

    const now = new Date();
    await this.applicationRepository.update(
      { userId: targetUserId, retreatId },
      {
        checkedInAt: now,
        status: ApplicationStatus.CHECKED_IN,
      },
    );

    this.logger.log(
      `체크인 완료: ${application.user.name}(${targetUserId}) - 승인 계정 ID: ${adminUserId}`,
    );

    return { checkedInAt: now };
  }
}
