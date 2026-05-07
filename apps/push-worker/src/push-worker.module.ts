import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from '@infrastructure/database/database.module';
import { RabbitMqModule } from '@infrastructure/rabbitmq/rabbitmq.module';
import { PushInfraModule } from '@infrastructure/push/push-infra.module';
import { PushNotificationScheduler } from '@infrastructure/push/push-notification.scheduler';
import { RedisModule } from '@infrastructure/redis/redis.module';
import { PushTokenModule } from '@modules/push-token/push-token.module';
import { getEnvFilePath } from '@shared/config/env-file-path';
import { PushNoticeWorkerController } from './push-notice.worker-controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getEnvFilePath(),
    }),
    DatabaseModule,
    RabbitMqModule,
    RedisModule,
    PushTokenModule,
    PushInfraModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [PushNoticeWorkerController],
  providers: [PushNotificationScheduler],
})
export class PushWorkerModule {}
