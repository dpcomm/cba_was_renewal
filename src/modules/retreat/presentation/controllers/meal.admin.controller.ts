import {
  Controller,
  Post,
  Patch,
  Get,
  Delete,
  Body,
  Query,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

import { CreateMealUseCase } from '@modules/retreat/application/usecase/meal.create.usecase';
import { UpdateMealUseCase } from '@modules/retreat/application/usecase/meal.update.usecase';
import { DeleteMealUseCase } from '@modules/retreat/application/usecase/meal.delete.usecase';
import { GetMealListQuery } from '@modules/retreat/application/query/get-meal-list.query';
import { GetMealCountQuery } from '@modules/retreat/application/query/get-meal-count.query';

import { MealMapper } from '@modules/retreat/application/mappers/meal.mapper';

import { MealCreateRequestDto } from '@modules/retreat/presentation/dto/request/meal-create.request.dto';
import { MealUpdateRequestDto } from '@modules/retreat/presentation/dto/request/meal-update.request.dto';
import { MealListRequestDto } from '@modules/retreat/presentation/dto/request/meal-get.request.dto';

import { MealDto } from '../dto/meal.dto';
import { MealCountResponseDto } from '../dto/response/meal-count.response.dto';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { RankGuard } from '@shared/decorators/rank-guard.decorator';
import { UserRank } from '@modules/user/domain/enums/user-rank.enum';
import { JwtGuard } from '@shared/decorators/jwt-guard.decorator';
import { ok } from '@shared/responses/api-response';

@ApiTags('Admin Meal')
@Controller('admin/meals')
@RankGuard(UserRank.ADMIN)
@JwtGuard()
export class AdminMealController {
  constructor(
    private readonly createMealUseCase: CreateMealUseCase,
    private readonly updateMealUseCase: UpdateMealUseCase,
    private readonly deleteMealUseCase: DeleteMealUseCase,
    private readonly getMealListQuery: GetMealListQuery,
    private readonly getMealCountQuery: GetMealCountQuery,
    private readonly mealMapper: MealMapper,
  ) {}

  @Post()
  @ApiOperation({ summary: '식사 슬롯 생성' })
  @ApiSuccessResponse({ status: 201, type: MealDto })
  async create(
    @Body() dto: MealCreateRequestDto,
  ) {
    const result = await this.createMealUseCase.execute(dto);
    return ok(this.mealMapper.toDto(result), 'Success create meal slot');
  }

  @Patch()
  @ApiOperation({ summary: '식사 슬롯 수정' })
  @ApiSuccessResponse({ status: 200, type: MealDto })
  async update(
    @Body() dto: MealUpdateRequestDto,
  ) {
    const result = await this.updateMealUseCase.execute(dto);
    return ok(this.mealMapper.toDto(result), 'Success update meal slot');
  }

  @Delete(':id')
  @ApiOperation({ summary: '식사 슬롯 삭제' })
  @ApiSuccessResponse({ status: 200, description: '삭제 성공' })
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.deleteMealUseCase.execute(id);
    return ok(null, 'Success delete meal slot');
  }

  @Get()
  @ApiOperation({ summary: '식사 슬롯 목록 조회' })
  @ApiSuccessResponse({ status: 200, type: MealDto, isArray: true })
  async getList(
    @Query() dto: MealListRequestDto,
  ) {
    const result = await this.getMealListQuery.execute(dto);
    return ok(this.mealMapper.toDtoList(result), 'Success get meal list');
  }

  @Get('count/:retreatId')
  @ApiOperation({ summary: '식수 집계 조회' })
  @ApiSuccessResponse({ status: 200, type: MealCountResponseDto, isArray: true })
  async getCount(
    @Param('retreatId', ParseIntPipe) retreatId: number,
  ) {
    const result = await this.getMealCountQuery.execute(retreatId);
    return ok(this.mealMapper.toMealCountDtoList(result), 'Success get meal count');
  }
}