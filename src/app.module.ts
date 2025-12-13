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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'prod' ? '.env.prod' : '.env.dev',
    }),
    DatabaseModule,
    RedisModule,
    AuthModule,
    ConsentModule,
    CarpoolModule,
    ChatModule,
    FirebaseModule,
    FcmTokenModule,
  ],
})
export class AppModule {}
