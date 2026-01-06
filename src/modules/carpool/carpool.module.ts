import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarpoolMember } from './domain/entities/carpool-member.entity';
import { CarpoolRoom } from './domain/entities/carpool-room.entity';
import { CarpoolService } from './application/services/carpool.service';
import { CarpoolController } from './presentation/controllers/carpool.controller';
import { CarpoolMapper } from './application/mappers/carpool.mapper';
import { User } from '@modules/user/domain/entities/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([CarpoolMember, CarpoolRoom, User])],
    controllers: [CarpoolController],
    providers: [CarpoolService, CarpoolMapper],
    exports: [CarpoolService],
})

export class CarpoolModule {}