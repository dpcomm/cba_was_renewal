import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@infrastructure/database/database.module';
import { ConsentModule } from '@modules/consent/consent.module';
import { RedisModule } from '@infrastructure/redis/redis.module';
import { CarpoolModule } from '@modules/carpool/carpool.module';
import { ChatModule } from '@modules/chat/chat.module';
import { AuthModule } from '@modules/auth/auth.module';
import { FirebaseModule } from '@infrastructure/firebase/firebase.module';
import { FcmTokenModule } from '@modules/fcm/fcm-token.module';
import { MailModule } from '@infrastructure/mail/mail.module';
import { UserModule } from '@modules/user/user.module';
import { StatusModule } from '@modules/status/status.module';
import { ExpoPushTokenModule } from '@modules/expo-push-token/expo-push-token.module';
import { NoticeModule } from '@modules/notice/notice.module';
import { PushNotificationModule } from '@modules/push-notification/push-notification.module';
import { LectureModule } from '@modules/lecture/lecture.module';
import { DashboardModule } from '@modules/dashboard/dashboard.module';
import { TermModule } from '@modules/term/term.module';
import { ApplicationModule } from '@modules/application/application.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'prod' ? '.env.prod' : '.env.dev',
    }),
    DatabaseModule,
    RedisModule,
    AuthModule,
    UserModule,
    StatusModule,
    ConsentModule,
    CarpoolModule,
    ChatModule,
    FirebaseModule,
    FcmTokenModule,
    MailModule,
    ExpoPushTokenModule,
    PushNotificationModule,
    NoticeModule,
    LectureModule,
    TermModule,
    DashboardModule,
    ApplicationModule,
    ScheduleModule.forRoot(),
  ],
})
export class AppModule {}
