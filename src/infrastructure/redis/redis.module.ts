import { Module, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';
import { REDIS_CLIENT_TOKEN } from '@shared/constants/redis.constants';

@Module({
  providers: [
    {
      provide: REDIS_CLIENT_TOKEN,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('RedisModule');
        const client = createClient({
          url: configService.getOrThrow('REDIS_URL'),
        });
        client.on('error', (err) => logger.error('Redis 연결 에러', err));
        await client.connect();
        return client;
      },
    },
  ],
  exports: [REDIS_CLIENT_TOKEN],
})
export class RedisModule {}
