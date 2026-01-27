import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notice } from '@modules/notice/domain/entities/notice.entity';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';
import { ExpoNotificationService } from './expo-notification/ExpoNotification.service';
import { ExpoPushTokenService } from '@modules/expo-push-token/application/services/expo-push-token.service';
import { noticePushRequestDto } from '../dto/notice-push.request.dto';
import { reservePushNotificationRequestDto } from '../dto/push-notification.request.dto';

@Injectable()
export class NoticePushService {
  constructor(
    @InjectRepository(Notice)
    private readonly noticeRepository: Repository<Notice>,
    private readonly expoMessageService: ExpoNotificationService,
    private readonly expoTokenService: ExpoPushTokenService,
  ) {}

  async sendNoticePush(id: number, dto: noticePushRequestDto): Promise<void> {
    const notice = await this.noticeRepository.findOne({
      where: { id: id },
    });

    if (!notice) {
      throw new NotFoundException(ERROR_MESSAGES.NOTICE_NOT_FOUND);
    }

    const includeBody = dto.includeBody !== false;
    const notification = {
      title: notice.title,
      body: includeBody ? notice.body : '',
      channelId: 'notice',
    };

    if (dto.reserveTime) {
      const reservation: reservePushNotificationRequestDto = {
        title: notice.title,
        body: includeBody ? notice.body : '',
        reserveTime: dto.reserveTime,
        target: dto.target,
      };
      await this.expoMessageService.reserve(reservation);
      return;
    }

    const tokens = await this.expoTokenService.getTokens(dto.target);
    await this.expoMessageService.send(tokens, notification);
  }
}
