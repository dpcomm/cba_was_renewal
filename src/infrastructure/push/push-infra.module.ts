import { Module } from '@nestjs/common';
import { RedisModule } from '@infrastructure/redis/redis.module';
import { ExpoNotificationService } from './expo-notification.service';
import { PUSH_SENDER_PORT } from '@modules/push-notification/application/ports/push-sender.port';

@Module({
  imports: [RedisModule],
  providers: [
    {
      provide: PUSH_SENDER_PORT,
      useClass: ExpoNotificationService,
    },
  ],
  exports: [PUSH_SENDER_PORT],
})
export class PushInfraModule {}
