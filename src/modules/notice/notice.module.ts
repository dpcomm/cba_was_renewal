import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notice } from './domain/entities/notice.entity';
import { NoticeService } from './application/services/notice.service';
import { NoticeController } from './presentation/controllers/notice.controller';
import { NoticeMapper } from './application/mappers/notice.mapper';
import { User } from '@modules/user/domain/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notice, User])],
  controllers: [NoticeController],
  providers: [NoticeService, NoticeMapper],
})
export class NoticeModule {}
