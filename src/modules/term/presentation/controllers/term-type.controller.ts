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
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { ApiFailureResponse } from '@shared/decorators/api-failure-response.decorator';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';

import { TermTypeService } from '@modules/term/application/services/term-type.service';
import { TermTypeMapper } from '@modules/term/application/mappers/term-type.mapper';
import { createTermTypeRequestDto } from '@modules/term/application/dto/term-type.request.dto';
import { 
    TermTypeResponseDto,
    TermTypeListResponse,
    TermTypeSingleResponse, 
} from '../dto/term-type.response.dto';
import { TermResponseDto } from '../dto/term.response.dto';
import { UserRank } from '@modules/user/domain/enums/user-rank.enum';

@ApiTags('TermType')
@Controller('termType')
@JwtGuard()
export class TermTypeController {
    constructor(
        private readonly termTypeService: TermTypeService,
        private readonly mapper: TermTypeMapper,
    ) {}

    @Get()
    @ApiOperation({ summary: 'term type 조회' })
    @ApiSuccessResponse({ type: TermTypeResponseDto, isArray: true})
    async getAll() {
        const types = await this.termTypeService.findAll();
        return ok<TermTypeListResponse>(
            this.mapper.toResponseList(types),
            'Success get types',
        );
    }

    @Get(':id')
    @ApiOperation({ summary: '단일 term type 조회' })
    @ApiSuccessResponse({ type: TermTypeResponseDto })
    @ApiFailureResponse(404, ERROR_MESSAGES.TERM_TYPE_NOT_FOUND)
    async getTermTypeById(
        @Param('id', ParseIntPipe) id: number,
    ) {
        const type = await this.termTypeService.findById(id);
        return ok<TermTypeSingleResponse>(
            this.mapper.toResponse(type),
            'Success get term',
        );
    }

    @Post()
    @RankGuard(UserRank.ADMIN)
    @ApiOperation({ summary: 'term type 생성' })
    @ApiSuccessResponse({ type: TermResponseDto })
    async createTermType(
        @Body() dto: createTermTypeRequestDto,
    ) {
        const type = await this.termTypeService.create(dto);
        return ok<TermTypeResponseDto>(
            this.mapper.toResponse(type),
            'Success crete term type',
        );
    }
}