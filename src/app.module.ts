import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@infrastructure/database/database.module';
import { ConsentModule } from '@modules/consent/consent.module';
import { RedisModule } from '@infrastructure/redis/redis.module';
import { CarpoolModule } from '@modules/carpool/carpool.module';
import { ChatModule } from '@modules/chat/chat.module';
import { AuthModule } from '@modules/auth/auth.module';

import { MailModule } from '@infrastructure/mail/mail.module';
import { UserModule } from '@modules/user/user.module';
import { SystemModule } from '@modules/system/system.module';
import { PushTokenModule } from '@modules/push-token/push-token.module';
import { NoticeModule } from '@modules/notice/notice.module';
import { PushNotificationModule } from '@modules/push-notification/push-notification.module';
import { LectureModule } from '@modules/lecture/lecture.module';
import { DashboardModule } from '@modules/dashboard/dashboard.module';
import { TermModule } from '@modules/term/term.module';
import { ApplicationModule } from '@modules/application/application.module';
import { RetreatModule } from '@modules/retreat/retreat.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['prod', 'production'].includes(
        process.env.NODE_ENV || 'dev',
      )
        ? '.env.prod'
        : '.env.dev',
    }),
    DatabaseModule,
    RedisModule,
    AuthModule,
    UserModule,
    SystemModule,
    ConsentModule,
    CarpoolModule,
    ChatModule,

    MailModule,
    PushTokenModule,
    PushNotificationModule,
    NoticeModule,
    LectureModule,
    TermModule,
    DashboardModule,
    ApplicationModule,
    RetreatModule,
    ScheduleModule.forRoot(),
  ],
})
export class AppModule {}
