import { ApiProperty } from '@nestjs/swagger';
import { NoticeAuthorGroup } from '@modules/notice/domain/notice-author.enum';

export class NoticeResponseDto {
  @ApiProperty({ example: 3, required: true, description: '공지 ID' })
  id: number;

  @ApiProperty({
    example: NoticeAuthorGroup.DEVELOPMENT,
    enum: NoticeAuthorGroup,
    required: true,
    description: '공지 작성 주체',
  })
  author: NoticeAuthorGroup;

  @ApiProperty({
    example: '서비스 업데이트 안내',
    required: true,
    description: '공지 제목',
  })
  title: string;

  @ApiProperty({
    example: '최신 기능과 안정적인 사용을 위해 앱을 업데이트해주세요.',
    required: true,
    description: '공지 본문',
  })
  body: string;

  @ApiProperty({
    example: '2026-01-27T09:12:33.123Z',
    format: 'date-time',
    required: true,
    description: '생성 일시 (ISO 8601)',
  })
  createdAt: string;

  @ApiProperty({
    example: '2026-01-27T10:15:21.789Z',
    format: 'date-time',
    required: true,
    description: '수정 일시 (ISO 8601)',
  })
  updatedAt: string;
}

export type NoticeListResponse = NoticeResponseDto[];
export type NoticeSingleResponse = NoticeResponseDto | null;
