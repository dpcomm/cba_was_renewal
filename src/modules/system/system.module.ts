import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemConfig } from '@modules/system/domain/entities/system-config.entity';
import { SystemService } from '@modules/system/application/services/system.service';
import { SystemController } from '@modules/system/presentation/controller/system.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SystemConfig])],
  controllers: [SystemController],
  providers: [SystemService],
  exports: [SystemService],
})
export class SystemModule {}
