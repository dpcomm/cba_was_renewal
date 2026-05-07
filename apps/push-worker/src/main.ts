import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { PushWorkerModule } from './push-worker.module';
import { PUSH_WORKER_RMQ_OPTIONS } from '@infrastructure/rabbitmq/rabbitmq-worker-options';
import { KSTLogger } from '@shared/loggers/kst.logger';
import { getEnvFilePath } from '@shared/config/env-file-path';

async function bootstrap() {
  process.env.TZ = 'Asia/Seoul';
  dotenv.config({ path: getEnvFilePath() });

  const app = await NestFactory.createMicroservice(
    PushWorkerModule,
    PUSH_WORKER_RMQ_OPTIONS,
  );
  app.useLogger(new KSTLogger());
  app.enableShutdownHooks();

  await app.listen();
  new Logger('PushWorkerBootstrap').log('Push worker is listening');
}

void bootstrap();
