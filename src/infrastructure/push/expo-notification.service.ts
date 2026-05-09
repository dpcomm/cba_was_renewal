import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { Injectable, Logger } from '@nestjs/common';
import {
  IPushSenderPort,
  PushToken,
  PushMessage,
} from '@modules/push-notification/application/ports/push-sender.port';

@Injectable()
export class ExpoNotificationService implements IPushSenderPort {
  private expo: Expo;
  private readonly logger = new Logger(ExpoNotificationService.name);

  constructor() {
    this.expo = new Expo();
  }

  async send(
    tokens: PushToken[],
    message: PushMessage,
    data?: Record<string, any>,
  ): Promise<void> {
    const messages: ExpoPushMessage[] = [];

    for (const tokenEntity of tokens) {
      const token = tokenEntity.token;

      if (!Expo.isExpoPushToken(token)) {
        this.logger.warn(`유효하지 않은 Expo 푸시 토큰: ${token as string}`);
        continue;
      }

      messages.push({
        to: token,
        sound: 'default',
        title: message.title,
        body: message.body,
        channelId: message.channelId,
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
        this.logger.error('Expo 푸시 전송 에러:', error);
      }
    }
  }
}
