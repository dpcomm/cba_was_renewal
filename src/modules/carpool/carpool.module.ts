import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarpoolMember } from './domain/entities/carpool-member.entity';
import { CarpoolRoom } from './domain/entities/carpool-room.entity';
import { CarpoolService } from './application/services/carpool.service';
import { CarpoolController } from './presentation/controllers/carpool.controller';
import { CarpoolMapper } from './application/mappers/carpool.mapper';
import { User } from '@modules/user/domain/entities/user.entity';
import { PushInfraModule } from '@infrastructure/push/push-infra.module';
import { PushTokenModule } from '@modules/push-token/push-token.module';
import { CarpoolSchedulerService } from './application/services/carpool.schedule.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CarpoolMember, CarpoolRoom, User]),
    PushInfraModule,
    PushTokenModule,
  ],
  controllers: [CarpoolController],
  providers: [CarpoolService, CarpoolMapper, CarpoolSchedulerService],
  exports: [CarpoolService],
})
export class CarpoolModule {}
