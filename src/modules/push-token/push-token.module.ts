import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PushToken } from './domain/entities/push-token.entity';
import { User } from '@modules/user/domain/entities/user.entity';
import { PushTokenService } from './application/push-token.service';
import { PushTokenController } from './presentation/push-token.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PushToken, User])],
  controllers: [PushTokenController],
  providers: [PushTokenService],
  exports: [PushTokenService],
})
export class PushTokenModule {}
