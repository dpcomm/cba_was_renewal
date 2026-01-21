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
import { ApiOkResponse, ApiOperation, ApiRequestTimeoutResponse, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '@shared/decorators/jwt-guard.decorator';
import { RankGuard } from '@shared/decorators/rank-guard.decorator';
import { UserRank } from '@modules/user/domain/enums/user-rank.enum';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { ApiFailureResponse } from '@shared/decorators/api-failure-response.decorator';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';

import { TermService } from '@modules/term/application/services/term.service';
import { TermMapper } from '@modules/term/application/mappers/term.mapper';
import { 
    createTermRequestDto,
    updateTermRequestDto,
    getTermFilterDto, 
} from '@modules/term/application/dto/term.request.dto';
import { 
    TermResponseDto,
    TermListResponse,
    TermSingleResponse, 
} from '../dto/term.response.dto';

import { LectureMapper } from '@modules/lecture/application/mappers/lecture.mapper';
import { LectureListResponse, LectureResponseDto } from '@modules/lecture/presentation/dto/lecture.response.dto';

@ApiTags('Term')
@Controller('term')
@JwtGuard()
export class TermController {
    constructor(
        private readonly termService: TermService,
        private readonly mapper: TermMapper,
        private readonly lectureMapper: LectureMapper,
    ) {}

    // term 생성
    @Post()
    @RankGuard(UserRank.ADMIN)
    @ApiOperation({ summary: 'term 생성' })
    @ApiSuccessResponse({ type: TermResponseDto })
    @ApiFailureResponse(404, ERROR_MESSAGES.TERM_TYPE_NOT_FOUND)
    @ApiFailureResponse(409, ERROR_MESSAGES.TERM_ALREADY_EXISTS)
    async createTerm(
        @Body() dto: createTermRequestDto,
    ) {
        const term = await this.termService.create(dto);
        return ok<TermResponseDto>(
            this.mapper.toResponse(term),
            'Success create term',
        );
    }

    // term 목록 조회 (필터 기반)
    @Get()
    @ApiOperation({ summary: 'term 목록 조회 (필터 기반)' })
    @ApiSuccessResponse({ type: TermResponseDto, isArray: true })
    async getTerms(
        @Query() filter: getTermFilterDto,
    ) {
        const terms = await this.termService.getTerms(filter);
        return ok<TermListResponse>(
            this.mapper.toReponseList(terms),
            'Success get terms',
        );
    }

    // term 단건 조회
    @Get(':id')
    @ApiOperation({ summary: 'term 단건 조회' })
    @ApiSuccessResponse({ type: TermResponseDto })
    @ApiFailureResponse(404, ERROR_MESSAGES.TERM_NOT_FOUND)
    async getTermById(
        @Param('id', ParseIntPipe) id: number,
    ) {
        const term = await this.termService.getTermById(id);
        return ok<TermResponseDto>(
            this.mapper.toResponse(term),
            'Success get term',
        );
    }

    // term 수정
    @Post('update')
    @RankGuard(UserRank.ADMIN)
    @ApiOperation({ summary: 'term 수정' })
    @ApiSuccessResponse({ type: TermResponseDto })
    @ApiFailureResponse(404, ERROR_MESSAGES.TERM_NOT_FOUND)
    async updateTerm(
        @Body() dto: updateTermRequestDto,
    ) {
        const term = await this.termService.update(dto);
        return ok<TermResponseDto>(
            this.mapper.toResponse(term),
            'Success update term',
        );
    }

    // term에 등록된 lecture 목록 조회
    @Get(':id/lectures')
    @ApiOperation({ summary: 'term에 등록된 강의 목록 조회' })
    @ApiSuccessResponse({ type: LectureResponseDto, isArray: true })
    @ApiFailureResponse(404, ERROR_MESSAGES.TERM_NOT_FOUND)
    async getLectures(
        @Param('id', ParseIntPipe) id: number,
    ) {
        const lectures = await this.termService.findLectures(id);
        return ok<LectureListResponse>(
            this.lectureMapper.toResponseList(lectures),
            'Success get lectures',
        );
    }
}