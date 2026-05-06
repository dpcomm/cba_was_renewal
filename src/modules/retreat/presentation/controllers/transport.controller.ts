import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Query,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdminGuard } from '@shared/decorators/admin-guard.decorator';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { ok } from '@shared/responses/api-response';

import { CreateTransportUseCase } from '../../application/usecases/transport-create.usecase';
import { UpdateTransportUseCase } from '../../application/usecases/transport-update.usecase';
import { DeleteTransportUseCase } from '../../application/usecases/transport-delete.usecase';
import { GetTransportListQuery } from '../../application/queries/get-transport-list.query';
import { GetTransportQuery } from '../../application/queries/get-transport.query';

import { TransportCreateRequestDto } from '../dto/request/transport-create.request.dto';
import { TransportUpdateRequestDto } from '../dto/request/transport-update.request.dto';
import { TransportListQueryRequestDto } from '../dto/request/transport-list-query.request.dto';
import { TransportResponseDto } from '../dto/response/transport.response.dto';

@ApiTags('Admin - Retreat Transport')
@Controller('admin/transport')
@AdminGuard()
export class TransportController {
  constructor(
    private readonly createTransportUseCase: CreateTransportUseCase,
    private readonly updateTransportUseCase: UpdateTransportUseCase,
    private readonly deleteTransportUseCase: DeleteTransportUseCase,
    private readonly getTransportListQuery: GetTransportListQuery,
    private readonly getTransportQuery: GetTransportQuery,
  ) {}

  @Get()
  @ApiOperation({ summary: '[관리자] 교통 옵션 목록 조회' })
  @ApiSuccessResponse({ type: TransportResponseDto, isArray: true })
  async getList(@Query() query: TransportListQueryRequestDto) {
    const { items, total } = await this.getTransportListQuery.execute({
      retreatId: query.retreatId,
      direction: query.direction,
      transportType: query.transportType,
      search: query.search,
      page: query.page,
      limit: query.limit,
    });

    return ok(
      {
        items: items.map((t) => new TransportResponseDto(t)),
        total,
      },
      'Success fetch transport options',
    );
  }

  @Get(':id')
  @ApiOperation({ summary: '[관리자] 교통 옵션 상세 조회' })
  @ApiSuccessResponse({ type: TransportResponseDto })
  async getDetail(@Param('id', ParseIntPipe) id: number) {
    const result = await this.getTransportQuery.execute(id);
    return ok(new TransportResponseDto(result), 'Success fetch transport detail');
  }

  @Post()
  @ApiOperation({ summary: '[관리자] 교통 옵션 생성' })
  @ApiSuccessResponse({ type: TransportResponseDto })
  async create(@Body() dto: TransportCreateRequestDto) {
    const result = await this.createTransportUseCase.execute({
      retreatId: dto.retreatId,
      direction: dto.direction,
      transportType: dto.transportType,
      name: dto.name,
      isVehicleRequired: dto.isVehicleRequired,
      isRemarkRequired: dto.isRemarkRequired,
    });
    return ok(new TransportResponseDto(result), 'Success create transport option');
  }

  @Patch()
  @ApiOperation({ summary: '[관리자] 교통 옵션 수정' })
  @ApiSuccessResponse({ type: TransportResponseDto })
  async update(@Body() dto: TransportUpdateRequestDto) {
    const result = await this.updateTransportUseCase.execute(dto.id, {
      direction: dto.direction,
      transportType: dto.transportType,
      name: dto.name,
      isVehicleRequired: dto.isVehicleRequired,
      isRemarkRequired: dto.isRemarkRequired,
    });
    return ok(new TransportResponseDto(result), 'Success update transport option');
  }

  @Delete(':id')
  @ApiOperation({ summary: '[관리자] 교통 옵션 삭제' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.deleteTransportUseCase.execute(id);
    return ok(null, 'Success delete transport option');
  }
}
