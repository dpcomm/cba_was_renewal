import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository, DataSource } from 'typeorm';
import { Notice } from '@modules/notice/domain/entities/notice.entity';
import {
  createNoticeRequestDto,
  getNoticeListRequestDto,
  updateNoticeRequestDto,
  noticePushRequestDto,
} from '../dto/notice.request.dto';
import { NoticeAuthorGroup } from '@modules/notice/domain/notice-author.enum';
import { ExpoNotificationService } from '@modules/push-notification/application/services/expo-notification/ExpoNotification.service';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';
import { ExpoPushTokenService } from '@modules/expo-push-token/application/services/expo-push-token.service';
import { NoticeNotificationDto } from '@modules/push-notification/application/dto/notice-notification.dto';
import { reservePushNotificationRequestDto } from '@modules/push-notification/application/dto/push-notification.request.dto';

@Injectable()
export class NoticeService {
  constructor(
    @InjectRepository(Notice)
    private noticeRepository: Repository<Notice>,
    private readonly expoMessageService: ExpoNotificationService,
    private readonly expoTokenService: ExpoPushTokenService,
  ) {}

  // 공지 생성
  async createNotice(dto: createNoticeRequestDto): Promise<Notice> {
    const notice = this.noticeRepository.create({
      author: dto.author,
      title: dto.title,
      body: dto.body,
    });

    const savedNotice = await this.noticeRepository.save(notice);

    if (dto.sendPush === false) {
      return savedNotice;
    }

    if (dto.reserveTime) {
      const reservation: reservePushNotificationRequestDto = {
        title: dto.title,
        body: dto.body,
        reserveTime: dto.reserveTime,
      };
      await this.expoMessageService.reserve(reservation);
    } else {
      const tokens = await this.expoTokenService.getTokens();
      const notification = new NoticeNotificationDto(dto.title);

      await this.expoMessageService.send(tokens, notification);
    }

    return savedNotice;
  }

  // id를 통한 공지 조회
  async getNotice(id: number): Promise<Notice> {
    const notice = await this.noticeRepository.findOne({
      where: { id: id },
    });

    if (!notice) {
      throw new NotFoundException(ERROR_MESSAGES.NOTICE_NOT_FOUND);
    }

    return notice;
  }

  // 공지 목록 조회
  // authorGroup으로 인한 filtering
  // 만약 null값이라면 전체 조회
  async getNoticeList(dto: getNoticeListRequestDto): Promise<Notice[]> {
    const where = dto.author ? { author: dto.author } : {};

    return this.noticeRepository.find({
      where,
      order: {
        createdAt: 'DESC',
      },
    });
  }

  // 공지 수정
  async updateNotice(dto: updateNoticeRequestDto): Promise<Notice> {
    const notice = await this.noticeRepository.findOne({
      where: { id: dto.id },
    });

    if (!notice) {
      throw new NotFoundException(ERROR_MESSAGES.NOTICE_NOT_FOUND);
    }

    if (dto.author !== undefined) {
      notice.author = dto.author;
    }

    if (dto.title !== undefined) {
      notice.title = dto.title;
    }

    if (dto.body !== undefined) {
      notice.body = dto.body;
    }

    return this.noticeRepository.save(notice);
  }

  // 공지 삭제
  async deleteNotice(id: number): Promise<void> {
    const result = await this.noticeRepository.delete({
      id: id,
    });

    if ((result.affected ?? 0) === 0) {
      throw new NotFoundException(ERROR_MESSAGES.NOTICE_NOT_FOUND);
    }
  }

  async sendNoticePush(id: number, dto: noticePushRequestDto): Promise<void> {
    const notice = await this.getNotice(id);
    const notification = new NoticeNotificationDto(notice.title);

    if (dto.reserveTime) {
      const reservation: reservePushNotificationRequestDto = {
        title: notification.title,
        body: notification.body,
        reserveTime: dto.reserveTime,
      };
      await this.expoMessageService.reserve(reservation);
      return;
    }

    const tokens = await this.expoTokenService.getTokens();
    await this.expoMessageService.send(tokens, notification);
  }
}
