import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@infrastructure/database/database.module';
import { ConsentModule } from '@modules/consent/consent.module';
import { RedisModule } from '@infrastructure/database/redis.module';
import { CarpoolModule } from '@modules/carpool/carpool.module';
import { ChatModule } from '@modules/chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'prod' ? '.env.prod' : '.env.dev',
    }),
    DatabaseModule,
    ConsentModule,
    CarpoolModule,
    ChatModule,
    RedisModule,
  ],
})
export class AppModule {}
