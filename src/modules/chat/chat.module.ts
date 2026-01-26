import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from './domain/entities/chat.entity';
import { ChatReport } from './domain/entities/chat-report.entity';
import { CarpoolRoom } from '@modules/carpool/domain/entities/carpool-room.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Chat, ChatReport, CarpoolRoom])],
})
export class ChatModule {}
