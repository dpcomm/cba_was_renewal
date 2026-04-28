import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { SurveyService } from '../../application/services/survey.service';

import {
  CreateSurveyRequestDto,
  UpdateSurveyPeriodRequestDto,
  GetSurveyByRetreatRequestDto,
  PreviewSurveyRequestDto,
  DeleteSurveyRequestDto,
} from '../../application/dto/survey.request.dto';

import {
  SurveySummaryResponseDto,
  SurveyResponseDto,
  SurveyPreviewResponseDto,
} from '../dto/survey.response.dto';
import { JwtGuard } from '@shared/decorators/jwt-guard.decorator';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { ok } from '@shared/responses/api-response';

@ApiTags('Survey')
@Controller('surveys')
@JwtGuard()
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  /**
   * 수련회별 설문 조회 (summary)
   */
  @Get('retreat/:retreatId')
  @ApiOperation({ summary: '수련회별 설문 조회' })
  @ApiSuccessResponse({ type: SurveySummaryResponseDto, isArray: true })
  async getSurveyByRetreat(
    @Param('retreatId', ParseIntPipe) retreatId: number,
  ) {
    const result = await this.surveyService.getSurveyByRetreat(retreatId);
    return ok(result, 'Success get survey list by retreatId');
  }

  /**
   * 설문 상세 조회 (관리용: 질문만 포함)
   */
  @Get(':surveyId')
  @ApiOperation({ summary: '설문 상세 조회 (질문 포함)' })
  @ApiSuccessResponse({ type: SurveyResponseDto })
  async getSurvey(
    @Param('surveyId', ParseIntPipe) surveyId: number,
  ) {
    const result = await this.surveyService.getSurvey(surveyId);
    return ok(result, 'Success get survey detail by surveyId');
  }

  /**
   * 설문 미리보기 (질문 + 옵션 포함)
   */
  @Get(':surveyId/preview')
  @ApiOperation({ summary: '설문 미리보기 (옵션 포함)' })
  @ApiSuccessResponse({ type: SurveyPreviewResponseDto })
  async previewSurvey(
    @Param('surveyId', ParseIntPipe) surveyId: number,
  ) {
    const result = await this.surveyService.previewSurvey(surveyId);
    return ok(result, 'Success get survey overview');
  }

}