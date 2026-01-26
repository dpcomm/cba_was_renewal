import { ApiProperty } from '@nestjs/swagger';
import { NoticeAuthorGroup } from '@modules/notice/domain/notice-author.enum';

export class NoticeResponseDto {
  @ApiProperty({ example: 3, required: true })
  id: number;

  @ApiProperty({
    example: NoticeAuthorGroup.DEVELOPMENT,
    enum: NoticeAuthorGroup,
    required: true,
  })
  author: NoticeAuthorGroup;

  @ApiProperty({ example: '업데이트 공지', required: true })
  title: string;

  @ApiProperty({
    example: '최신 기능과 안정적인 사용을 위해 앱을 업데이트해주세요.',
    required: true,
  })
  body: string;

  @ApiProperty({
    example: '2025-11-30T09:12:33.123Z',
    format: 'date-time',
    required: true,
  })
  createdAt: string;

  @ApiProperty({
    example: '2025-11-30T10:15:21.789Z',
    format: 'date-time',
    required: true,
  })
  updatedAt: string;
}

export type NoticeListResponse = NoticeResponseDto[];
export type NoticeSingleResponse = NoticeResponseDto | null;
