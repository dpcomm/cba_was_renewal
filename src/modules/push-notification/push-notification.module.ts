import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpoNotificationService } from './application/services/expo-notification/ExpoNotification.service';
import { FcmNotificationService } from './application/services/FCM/FCMnotification.service';
import { CarpoolRoom } from '@modules/carpool/domain/entities/carpool-room.entity';
import { CarpoolMember } from '@modules/carpool/domain/entities/carpool-member.entity';
import { User } from '@modules/user/domain/entities/user.entity';
import { ExpoPushToken } from '@modules/expo-push-token/domain/entities/expo-push-token.entity';
import { PushNofiticationController } from './presentation/controllers/push-notification.controller';
import { ExpoPushTokenModule } from '@modules/expo-push-token/expo-push-token.module';
import { RedisModule } from '@infrastructure/redis/redis.module';
import { ExpoNotificationScheduleService } from './application/services/expo-notification/expoNotification.schedule.service';

@Module({
  imports: [ExpoPushTokenModule, RedisModule],
  controllers: [PushNofiticationController],
  providers: [ExpoNotificationService, ExpoNotificationScheduleService],
  exports: [ExpoNotificationService],
})
export class PushNotificationModule {}
