import { Application } from '@modules/application/domain/entities/application.entity';
import {
  ApplicationStatus,
  EventResult,
} from '@modules/application/domain/enum/application.enum';
import { User } from '@modules/user/domain/entities/user.entity';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';
import { DataSource } from 'typeorm';

@Injectable()
export class PlayEventUseCase {
  private readonly logger = new Logger(PlayEventUseCase.name);

  constructor(private readonly dataSource: DataSource) {}

  async execute(
    userId: string,
    retreatId: number,
  ): Promise<{ eventResult: EventResult }> {
    return this.dataSource.transaction(async (manager) => {
      const application = await manager.findOne(Application, {
        where: { userId, retreatId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!application) {
        throw new NotFoundException(ERROR_MESSAGES.APPLICATION_NOT_FOUND);
      }

      if (application.status !== ApplicationStatus.CHECKED_IN) {
        throw new ForbiddenException(ERROR_MESSAGES.APPLICATION_NOT_CHECKED_IN);
      }

      if (application.eventResult || application.eventParticipatedAt) {
        throw new ConflictException(ERROR_MESSAGES.EVENT_ALREADY_PLAYED);
      }

      let result = EventResult.LOSE;

      const winnerCount = await manager.count(Application, {
        where: {
          retreatId,
          eventResult: EventResult.WIN,
        },
      });

      if (winnerCount < 10) {
        const isWin = Math.random() < 0.1;
        if (isWin) {
          result = EventResult.WIN;
        }
      }

      await manager.update(
        Application,
        { userId, retreatId },
        {
          eventResult: result,
          eventParticipatedAt: new Date(),
        },
      );

      const user = await manager.findOne(User, {
        where: { userId: userId },
        select: ['name'],
      });
      this.logger.log(
        `이벤트 참여: ${user?.name ?? '알수없음'}(${userId}) -> 결과: ${result}`,
      );

      return { eventResult: result };
    });
  }
}
