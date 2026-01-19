import { Expo, ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk";
import { NotificationDto } from "../../dto/notification.dto";
import { ExpoPushToken } from "@modules/expo-push-token/domain/entities/expo-push-token.entity";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ExpoNotificationService {
    private expo: Expo;

    constructor() {
        this.expo = new Expo();
    }

    async send(
        tokens: ExpoPushToken[],
        dto: NotificationDto,
        data?: Record<string, any>
    ): Promise<void> {
        const messages: ExpoPushMessage[] = [];

        for (const tokenEntity of tokens) {
            const token = tokenEntity.token;

            if (!Expo.isExpoPushToken(token)) {
                console.warn(`Invalid Expo push token: ${token}`);
                continue;
            }

            messages.push({
                to: token,
                sound: "default",
                title: dto.title,
                body: dto.body,
                channelId: dto.channelId,
                data,
            });
        }

        const chunks = this.expo.chunkPushNotifications(messages);
        const tickets: ExpoPushTicket[] = [];

        for (const chunk of chunks) {
            try {
                const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
                tickets.push(...ticketChunk);
            } catch (error) {
                console.error("Expo push send error:", error);
            }
        }

        // ❗ optional: receipt 확인용 (바로는 안 옴)
        // await this.handleReceipts(tickets);
    }
}
