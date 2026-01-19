import { Module } from '@nestjs/common';
import { StatusController } from './presentation/status.controller';

@Module({
  controllers: [StatusController],
})
export class StatusModule {}
