import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import {
  PUSH_SENDER_PORT,
  IPushSenderPort,
  PushMessage,
} from '@modules/push-notification/application/ports/push-sender.port';
import { PushTokenService } from '@modules/push-token/application/push-token.service';

@Injectable()
export class PushNotificationScheduler {
  private readonly logger = new Logger(PushNotificationScheduler.name);

  constructor(
    @Inject(PUSH_SENDER_PORT)
    private readonly pushSender: IPushSenderPort,
    private readonly tokenService: PushTokenService,
  ) {}

  @Cron('* * * * *')
  async pollReservation() {
    const now = Date.now();

    const reservations = await this.pushSender.popDueReservations(now);
    if (reservations.length === 0) return;

    for (const r of reservations) {
      try {
        const tokens = await this.tokenService.getTokens(r.target);

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
