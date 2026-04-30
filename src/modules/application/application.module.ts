import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from './domain/entities/application.entity';
import { ApplicationController } from './presentation/controller/application.controller';
import { ApplicationAdminController } from './presentation/controller/application-admin.controller';
import { ApplicationService } from './application/services/application.service';

@Module({
  imports: [TypeOrmModule.forFeature([Application])],
  controllers: [ApplicationController, ApplicationAdminController],
  providers: [ApplicationService],
})
export class ApplicationModule {}
