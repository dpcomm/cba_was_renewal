import { Injectable } from '@nestjs/common';
import { Notice } from '@modules/notice/domain/entities/notice.entity';
import {
  NoticeResponseDto,
  NoticeListResponse,
  NoticeSingleResponse,
} from '@modules/notice/presentation/dto/notice.response.dto';

@Injectable()
export class NoticeMapper {
  toResponse(notice: Notice): NoticeResponseDto {
    return {
      id: notice.id,
      author: notice.author,
      title: notice.title,
      body: notice.body,
      createdAt: notice.createdAt.toISOString(),
      updatedAt: notice.updatedAt.toISOString(),
    };
  }

  toResponseList(notices: Notice[]): NoticeListResponse {
    return notices.map((notice) => this.toResponse(notice));
  }

  toResponseOrNull(notice: Notice | null): NoticeSingleResponse {
    return notice ? this.toResponse(notice) : null;
  }
}
