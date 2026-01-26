import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpoPushToken } from './domain/entities/expo-push-token.entity';
import { User } from '@modules/user/domain/entities/user.entity';
import { ExpoPushTokenService } from './application/services/expo-push-token.service';
import { ExpoPushTokenController } from './presentation/controllers/expo-push-token.controller';
import { ExpoPushTokenMapper } from './application/mappers/expo-push-token.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([ExpoPushToken, User])],
  controllers: [ExpoPushTokenController],
  providers: [ExpoPushTokenService, ExpoPushTokenMapper],
  exports: [ExpoPushTokenService],
})
export class ExpoPushTokenModule {}
