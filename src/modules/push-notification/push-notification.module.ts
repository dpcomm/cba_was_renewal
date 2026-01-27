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
import { Notice } from '@modules/notice/domain/entities/notice.entity';
import { NoticePushService } from './application/services/notice-push.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notice]),
    ExpoPushTokenModule,
    RedisModule,
  ],
  controllers: [PushNofiticationController],
  providers: [
    ExpoNotificationService,
    ExpoNotificationScheduleService,
    NoticePushService,
  ],
  exports: [ExpoNotificationService],
})
export class PushNotificationModule {}
