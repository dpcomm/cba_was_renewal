import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ok } from '@shared/responses/api-response';
import { JwtGuard } from '@shared/decorators/jwt-guard.decorator';
import { RankGuard } from '@shared/decorators/rank-guard.decorator';
import { UserRank } from '@modules/user/domain/enums/user-rank.enum';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { ApiFailureResponse } from '@shared/decorators/api-failure-response.decorator';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';

import { RetreatService } from '@modules/retreat/application/services/retreat.service';
import { RetreatMapper } from '@modules/retreat/application/mappers/retreat.mapper';
import {
  CreateRetreatRequestDto,
  UpdateRetreatRequestDto,
} from '../../application/dto/retreat.request.dto';
import {
  RetreatResponseDto,
  RetreatListResponse,
  RetreatSingleResponse,
} from '../dto/retreat.response.dto';

@ApiTags('Admin Retreat')
@Controller('admin/retreat')
@JwtGuard()
export class RetreatController {
  constructor(
    private readonly retreatService: RetreatService,
    private readonly mapper: RetreatMapper,
  ) { }

  @Get()
  @ApiOperation({ summary: '수련회 목록 조회' })
  @ApiSuccessResponse({ type: RetreatResponseDto, isArray: true })
  async getAllRetreats() {
    const retreats = await this.retreatService.getAllRetreats();
    return ok<RetreatListResponse>(
      this.mapper.toResponseList(retreats),
      'Success get all retreats',
    );
  }

  @Get(':id')
  @ApiOperation({ summary: '수련회 상세 조회' })
  @ApiSuccessResponse({ type: RetreatResponseDto })
  @ApiFailureResponse(404, ERROR_MESSAGES.RETREAT_NOT_FOUND)
  async getRetreatById(@Param('id', ParseIntPipe) id: number) {
    const retreat = await this.retreatService.getRetreatById(id);
    return ok<RetreatSingleResponse>(
      this.mapper.toResponse(retreat),
      'Success get retreat',
    );
  }

  @Post()
  @RankGuard(UserRank.ADMIN)
  @ApiOperation({ summary: '수련회 생성' })
  @ApiSuccessResponse({ type: RetreatResponseDto })
  async createRetreat(@Body() dto: CreateRetreatRequestDto) {
    const retreat = await this.retreatService.createRetreat(dto);
    return ok<RetreatResponseDto>(
      this.mapper.toResponse(retreat),
      'Success create retreat',
    );
  }

  @Patch()
  @RankGuard(UserRank.ADMIN)
  @ApiOperation({ summary: '수련회 수정' })
  @ApiSuccessResponse({ type: RetreatResponseDto })
  @ApiFailureResponse(404, ERROR_MESSAGES.RETREAT_NOT_FOUND)
  async updateRetreat(@Body() dto: UpdateRetreatRequestDto) {
    const retreat = await this.retreatService.updateRetreat(dto);
    return ok<RetreatResponseDto>(
      this.mapper.toResponse(retreat),
      'Success update retreat',
    );
  }

  @Delete(':id')
  @RankGuard(UserRank.ADMIN)
  @ApiOperation({ summary: '수련회 삭제' })
  @ApiSuccessResponse({})
  @ApiFailureResponse(404, ERROR_MESSAGES.RETREAT_NOT_FOUND)
  async deleteRetreat(@Param('id', ParseIntPipe) id: number) {
    await this.retreatService.deleteRetreat(id);
    return ok<null>(null, 'Success delete retreat');
  }
}
