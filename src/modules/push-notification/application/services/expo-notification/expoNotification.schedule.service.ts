import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ExpoNotificationService } from './ExpoNotification.service';
import { ExpoPushTokenService } from '@modules/expo-push-token/application/services/expo-push-token.service';
import { NotificationDto } from '../../dto/notification.dto';

@Injectable()
export class ExpoNotificationScheduleService {
    private readonly logger = new Logger(ExpoNotificationScheduleService.name);

    constructor(
        private readonly expoService: ExpoNotificationService,
        private readonly tokenService: ExpoPushTokenService,
    ) {}

    @Cron('* * * * *')
    async pollReservation() {
        const now = Date.now();

        const reservations = await this.expoService.popDueReservations(now);
        if (reservations.length === 0) return;

        for (const r of reservations) {
            try {
                const tokens = await this.tokenService.getTokens(r.target);

                const dto: NotificationDto = {
                    title: r.title,
                    body: r.body,
                    channelId: 'schedule',
                };

                await this.expoService.send(tokens, dto);
            } catch (err) {
                this.logger.error(`Failed reservation ${r.id}`, err);
            }
        }

    }
}
