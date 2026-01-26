import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notice } from './domain/entities/notice.entity';
import { NoticeService } from './application/services/notice.service';
import { NoticeController } from './presentation/controllers/notice.controller';
import { NoticeMapper } from './application/mappers/notice.mapper';
import { User } from '@modules/user/domain/entities/user.entity';
import { PushNotificationModule } from '@modules/push-notification/push-notification.module';
import { ExpoPushTokenModule } from '@modules/expo-push-token/expo-push-token.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notice, User]),
    PushNotificationModule,
    ExpoPushTokenModule,
  ],
  controllers: [NoticeController],
  providers: [NoticeService, NoticeMapper],
})
export class NoticeModule {}
