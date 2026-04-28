import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notice } from '@modules/notice/domain/entities/notice.entity';
import {
  createNoticeRequestDto,
  getNoticeListRequestDto,
  updateNoticeRequestDto,
} from '../dto/notice.request.dto';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';

@Injectable()
export class NoticeService {
  private readonly logger = new Logger(NoticeService.name);

  constructor(
    @InjectRepository(Notice)
    private noticeRepository: Repository<Notice>,
  ) {}

  // 공지 생성
  async createNotice(dto: createNoticeRequestDto): Promise<Notice> {
    const notice = this.noticeRepository.create({
      author: dto.author,
      title: dto.title,
      body: dto.body,
    });

    const savedNotice = await this.noticeRepository.save(notice);

    this.logger.log(`공지 생성: ${savedNotice.title} by ${savedNotice.author}`);

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

    const updatedNotice = await this.noticeRepository.save(notice);
    this.logger.log(
      `공지 수정: ${updatedNotice.title} (ID: ${updatedNotice.id})`,
    );

    return updatedNotice;
  }

  // 공지 삭제
  async deleteNotice(id: number): Promise<void> {
    const result = await this.noticeRepository.delete({
      id: id,
    });

    if ((result.affected ?? 0) === 0) {
      throw new NotFoundException(ERROR_MESSAGES.NOTICE_NOT_FOUND);
    }

    this.logger.warn(`공지 삭제: ${id}`);
  }
}
