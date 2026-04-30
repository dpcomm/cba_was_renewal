import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsString, IsOptional } from 'class-validator';
import { NoticeAuthorGroup } from '@modules/notice/domain/notice-author.enum';

export class createNoticeRequestDto {
  @ApiProperty({
    example: NoticeAuthorGroup.DEVELOPMENT,
    enum: NoticeAuthorGroup,
    required: true,
    description: '공지 작성 주체',
  })
  @IsEnum(NoticeAuthorGroup)
  author: NoticeAuthorGroup;

  @ApiProperty({
    example: '서비스 업데이트 안내',
    required: true,
    description: '공지 제목',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: '최신 기능과 안정적인 사용을 위해 앱을 업데이트해주세요.',
    required: true,
    description: '공지 본문',
  })
  @IsString()
  body: string;

}

// export class getNoticeRequestDto {
//     @ApiProperty({example: 3, required: true})
//     @IsInt()
//     id: number;
// }

export class getNoticeListRequestDto {
  @ApiPropertyOptional({
    example: NoticeAuthorGroup.DEVELOPMENT,
    enum: NoticeAuthorGroup,
    description: '미입력 시 전체 공지 조회',
  })
  @IsOptional()
  @IsEnum(NoticeAuthorGroup)
  author?: NoticeAuthorGroup;
}

export class updateNoticeRequestDto {
  @ApiProperty({ example: 3, required: true, description: '공지 ID' })
  @IsInt()
  id: number;

  @ApiProperty({
    example: NoticeAuthorGroup.DEVELOPMENT,
    enum: NoticeAuthorGroup,
    description: '공지 작성 주체',
  })
  @IsOptional()
  @IsEnum(NoticeAuthorGroup)
  author?: NoticeAuthorGroup;

  @ApiProperty({ example: '서비스 업데이트 안내', description: '공지 제목' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    example: '최신 기능과 안정적인 사용을 위해 앱을 업데이트해주세요.',
    description: '공지 본문',
  })
  @IsOptional()
  @IsString()
  body?: string;
}
