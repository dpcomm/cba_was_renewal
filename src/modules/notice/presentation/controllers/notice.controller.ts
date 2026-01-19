import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ok } from '@shared/responses/api-response';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '@shared/decorators/jwt-guard.decorator';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { ApiFailureResponse } from '@shared/decorators/api-failure-response.decorator';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';
import { RankGuard } from '@shared/decorators/rank-guard.decorator';
import { UserRank } from '@modules/user/domain/enums/user-rank.enum';
import { NoticeService } from '@modules/notice/application/services/notice.service';
import { 
    createNoticeRequestDto,
    getNoticeListRequestDto,
    updateNoticeRequestDto,
} from '@modules/notice/application/dto/notice.request.dto';
import { 
    NoticeResponseDto, 
    NoticeListResponse,
    NoticeSingleResponse,
} from '../dto/notice.response.dto';
import { NoticeMapper } from '@modules/notice/application/mappers/notice.mapper';
import { NoticeAuthorGroup } from '@modules/notice/domain/notice-author.enum';


@ApiTags('Notice')
@Controller('notice')
@JwtGuard()
export class NoticeController {
    constructor(
        private readonly noticeService: NoticeService,
        private readonly mapper: NoticeMapper,
    ) {}

    @Post()
    @JwtGuard()
    @RankGuard(UserRank.ADMIN)
    @ApiOperation({ summary: '공지 등록'})
    @ApiSuccessResponse({ type: NoticeResponseDto })
    async createNotice(
        @Body() dto: createNoticeRequestDto
    ) {
        const notice = await this.noticeService.createNotice(dto);
        return ok<NoticeResponseDto>(
            this.mapper.toResponse(notice),
            'Success create notice',
        );
    }
    
    @Get()
    @ApiOperation({ summary: '공지 목록 조회'})
    @ApiSuccessResponse({ type: NoticeResponseDto, isArray: true})
    async getNoticeList(
        @Query() dto: getNoticeListRequestDto,
    ) {
        const notices = await this.noticeService.getNoticeList(dto);

        return ok<NoticeListResponse>(
            this.mapper.toResponseList(notices),
            'Success get notice list',
        );
    }

    @Get(':id')
    @ApiOperation({ summary: '공지 조회'})
    @ApiSuccessResponse({ type: NoticeResponseDto })
    @ApiFailureResponse(404, ERROR_MESSAGES.NOTICE_NOT_FOUND)
    async getNoticeById(
        @Param('id', ParseIntPipe) id: number
    ) {
        const notice = await this.noticeService.getNotice(id);
        return ok<NoticeSingleResponse>(
            this.mapper.toResponse(notice),
            'Success get notice',
        )
    }

    @Post('update')
    @JwtGuard()
    @RankGuard(UserRank.ADMIN)
    @ApiOperation({ summary: '공지 수정'})
    @ApiSuccessResponse({ type: NoticeResponseDto })
    @ApiFailureResponse(404, ERROR_MESSAGES.NOTICE_NOT_FOUND)
    async updateNotice(
        @Body() dto: updateNoticeRequestDto
    ) {
        const notice = await this.noticeService.updateNotice(dto);
        return ok<NoticeResponseDto>(
            this.mapper.toResponse(notice),
            'Success update notice',
        );
    }

    @Delete(':id')
    @JwtGuard()
    @RankGuard(UserRank.ADMIN)
    @ApiOperation({ summary: '공지 삭제'})
    @ApiSuccessResponse({})
    @ApiFailureResponse(404, ERROR_MESSAGES.NOTICE_NOT_FOUND)
    async deleteNotice(
        @Param('id', ParseIntPipe) id: number,
    ) {
        await this.noticeService.deleteNotice(id);

        return ok<null>(
            null,
            'Success delete notice',
        );
    }

}