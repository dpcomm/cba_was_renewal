import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';
import { NoticeAuthorGroup } from '@modules/notice/domain/notice-author.enum';

export class createNoticeRequestDto {
    
    @ApiProperty({example: NoticeAuthorGroup.DEVELOPMENT, enum: NoticeAuthorGroup, required: true})
    @IsEnum(NoticeAuthorGroup)
    author: NoticeAuthorGroup;

    @ApiProperty({example: '업데이트 공지', required: true})
    @IsString()
    title: string;

    @ApiProperty({example: '최신 기능과 안정적인 사용을 위해 앱을 업데이트해주세요.', required: true})
    @IsString()
    body: string;
}

// export class getNoticeRequestDto {
//     @ApiProperty({example: 3, required: true})
//     @IsInt()
//     id: number;
// }

export class getNoticeListRequestDto {
    @ApiPropertyOptional({example: NoticeAuthorGroup.DEVELOPMENT, enum: NoticeAuthorGroup, description: '미입력 시 전체 공지 조회'})
    @IsOptional()
    @IsEnum(NoticeAuthorGroup)
    author?: NoticeAuthorGroup;
}

export class updateNoticeRequestDto {

    @ApiProperty({example: 3, required: true})
    @IsInt()
    id: number;

    @ApiProperty({example: NoticeAuthorGroup.DEVELOPMENT, enum: NoticeAuthorGroup})
    @IsOptional()
    @IsEnum(NoticeAuthorGroup)
    author?: NoticeAuthorGroup;

    @ApiProperty({example: '업데이트 공지'})
    @IsOptional()
    @IsString()
    title?: string;

    @ApiProperty({example: '최신 기능과 안정적인 사용을 위해 앱을 업데이트해주세요.'})
    @IsOptional()
    @IsString()
    body?: string;    
}
