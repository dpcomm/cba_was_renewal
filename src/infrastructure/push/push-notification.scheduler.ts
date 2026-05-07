import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import {
  PUSH_SENDER_PORT,
  IPushSenderPort,
  PushMessage,
} from '@modules/push-notification/application/ports/push-sender.port';
import { PopDueReservationsUseCase } from '@modules/push-notification/application/usecases/pop-due-reservations.usecase';
import { GetPushTokensQuery } from '@modules/push-token/application/queries/get-push-tokens.query';

@Injectable()
export class PushNotificationScheduler {
  private readonly logger = new Logger(PushNotificationScheduler.name);

  constructor(
    @Inject(PUSH_SENDER_PORT)
    private readonly pushSender: IPushSenderPort,
    private readonly getPushTokensQuery: GetPushTokensQuery,
    private readonly popDueReservationsUseCase: PopDueReservationsUseCase,
  ) {}

  @Cron('* * * * *')
  async pollReservation() {
    const now = Date.now();

    const reservations = await this.popDueReservationsUseCase.execute(now);
    if (reservations.length === 0) return;

    for (const r of reservations) {
      try {
        const tokens = await this.getPushTokensQuery.execute(r.target);

        const message: PushMessage = {
          title: r.title,
          body: r.body,
          channelId: 'schedule',
        };

        await this.pushSender.send(tokens, message);
      } catch (err) {
        this.logger.error(`Failed reservation ${r.id}`, err);
      }
    }
  }
}
