import { Module } from '@nestjs/common';
import { ExpoNotificationService } from './expo-notification.service';
import { PUSH_SENDER_PORT } from '@modules/push-notification/application/ports/push-sender.port';

@Module({
  providers: [
    {
      provide: PUSH_SENDER_PORT,
      useClass: ExpoNotificationService,
    },
  ],
  exports: [PUSH_SENDER_PORT],
})
export class PushInfraModule {}
