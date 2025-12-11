import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Consent } from './domain/entities/consent.entity';
import { ConsentService } from './application/services/consent.service';
import { ConsentController } from './presentation/consent.controller';
import { ConsentMapper } from './application/mappers/consent.mapper';
import { User } from '@modules/user/domain/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Consent, User])],
  controllers: [ConsentController],
  providers: [ConsentService, ConsentMapper],
})
export class ConsentModule {}
