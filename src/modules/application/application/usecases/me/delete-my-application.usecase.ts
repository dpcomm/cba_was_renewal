import { Application } from '@modules/application/domain/entities/application.entity';
import { ApplicationStatus } from '@modules/application/domain/enum/application.enum';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';
import { DataSource, Not } from 'typeorm';

export interface DeleteMyApplicationResult {
  applicationId: number;
  retreatId: number;
  status: ApplicationStatus.CANCELED;
  canceled: true;
}

@Injectable()
export class DeleteMyApplicationUseCase {
  constructor(private readonly dataSource: DataSource) {}

  async execute(
    userId: string,
    retreatId: number,
  ): Promise<DeleteMyApplicationResult> {
    return this.dataSource.transaction(async (manager) => {
      const application = await manager.findOne(Application, {
        where: { userId, retreatId, status: Not(ApplicationStatus.CANCELED) },
        lock: { mode: 'pessimistic_write' },
      });

      if (!application) {
        throw new NotFoundException(ERROR_MESSAGES.APPLICATION_NOT_FOUND);
      }

      if (application.status === ApplicationStatus.CHECKED_IN) {
        throw new ConflictException(
          ERROR_MESSAGES.CHECKED_IN_APPLICATION_DELETE_NOT_ALLOWED,
        );
      }

      application.status = ApplicationStatus.CANCELED;
      application.checkedInAt = null;
      const canceledApplication = await manager.save(Application, application);

      return {
        applicationId: canceledApplication.id,
        retreatId: canceledApplication.retreatId,
        status: ApplicationStatus.CANCELED,
        canceled: true,
      };
    });
  }
}
