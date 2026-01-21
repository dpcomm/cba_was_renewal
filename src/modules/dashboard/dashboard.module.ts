import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from '@modules/application/domain/entities/application.entity';
import { Retreat } from '@modules/retreat/domain/entities/retreat.entity';
import { User } from '@modules/user/domain/entities/user.entity';
import { DashboardService } from './application/services/dashboard.service';
import { DashboardController } from './presentation/controllers/dashboard.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Application, Retreat, User])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
