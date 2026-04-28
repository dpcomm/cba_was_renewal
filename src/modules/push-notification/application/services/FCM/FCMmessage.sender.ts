// MulticastMessage형식으로 전달받은 message를 실질적으로 message를 전달하는 구간.
import admin from 'firebase-admin';
import { MulticastMessage, TopicMessage } from 'firebase-admin/messaging';

import { Logger } from '@nestjs/common';

export class FcmMessageSender {
  private readonly logger = new Logger(FcmMessageSender.name);
  // async send(message: MulticastMessage): Promise<void>;
  // async send(message: TopicMessage): Promise<void>;

  async send(message: MulticastMessage | TopicMessage): Promise<void> {
    if ('topic' in message) {
      const response = await admin.messaging().send(message);
      this.logger.log('토픽 메시지 전송 성공:', response);
      return;
    }
    const response = await admin.messaging().sendEachForMulticast(message);

    const invalidTokens: string[] = [];

    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        const code = resp.error?.code;
        if (
          code === 'messaging/invalid-registration-token' ||
          code === 'messaging/registration-token-not-registered'
        ) {
          invalidTokens.push(message.tokens[idx]);
        }
      }
    });

    if (invalidTokens.length > 0) {
      this.logger.warn('유효하지 않은 토큰 발견:', invalidTokens);
      // token 삭제 처리
    }
  }
}
