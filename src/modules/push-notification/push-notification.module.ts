import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PushNotificationAdminController } from './presentation/push-notification-admin.controller';
import { PushTokenModule } from '@modules/push-token/push-token.module';
import { PushInfraModule } from '@infrastructure/push/push-infra.module';
import { PushNotificationScheduler } from '@infrastructure/push/push-notification.scheduler';
import { Notice } from '@modules/notice/domain/entities/notice.entity';
import { NoticePushService } from './application/notice-push.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notice]),
    PushTokenModule,
    PushInfraModule,
  ],
  controllers: [PushNotificationAdminController],
  providers: [NoticePushService, PushNotificationScheduler],
})
export class PushNotificationModule {}
