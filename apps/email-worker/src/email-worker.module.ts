import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from '@infrastructure/mail/mail.module';
import { RedisModule } from '@infrastructure/redis/redis.module';
import { RabbitMqModule } from '@infrastructure/rabbitmq/rabbitmq.module';
import { getEnvFilePath } from '@shared/config/env-file-path';
import { EmailVerificationWorkerController } from './email-verification.worker-controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getEnvFilePath(),
    }),
    RedisModule,
    MailModule,
    RabbitMqModule,
  ],
  controllers: [EmailVerificationWorkerController],
})
export class EmailWorkerModule {}
