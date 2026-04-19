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

@ApiTags('Survey')
@Controller('surveys')
export class SurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  /**
   * 수련회별 설문 조회 (summary)
   */
  @Get('retreat/:retreatId')
  @ApiOperation({ summary: '수련회별 설문 조회' })
  @ApiResponse({ type: [SurveySummaryResponseDto] })
  async getSurveyByRetreat(
    @Param('retreatId', ParseIntPipe) retreatId: number,
  ): Promise<SurveySummaryResponseDto[]> {
    return this.surveyService.getSurveyByRetreat(retreatId);
  }

  /**
   * 설문 상세 조회 (관리용: 질문만 포함)
   */
  @Get(':surveyId')
  @ApiOperation({ summary: '설문 상세 조회 (질문 포함)' })
  @ApiResponse({ type: SurveyResponseDto })
  async getSurvey(
    @Param('surveyId', ParseIntPipe) surveyId: number,
  ): Promise<SurveyResponseDto> {
    return this.surveyService.getSurvey(surveyId);
  }

  /**
   * 설문 미리보기 (질문 + 옵션 포함)
   */
  @Get(':surveyId/preview')
  @ApiOperation({ summary: '설문 미리보기 (옵션 포함)' })
  @ApiResponse({ type: SurveyPreviewResponseDto })
  async previewSurvey(
    @Param('surveyId', ParseIntPipe) surveyId: number,
  ): Promise<SurveyPreviewResponseDto> {
    return this.surveyService.previewSurvey(surveyId);
  }

  /**
   * 설문 생성
   */
  @Post()
  @ApiOperation({ summary: '설문 생성' })
  @ApiResponse({ type: SurveySummaryResponseDto })
  async createSurvey(
    @Body() dto: CreateSurveyRequestDto,
  ): Promise<SurveySummaryResponseDto> {
    return this.surveyService.createSurvey(dto);
  }

  /**
   * 설문 기간 수정
   */
  @Patch()
  @ApiOperation({ summary: '설문 기간 수정' })
  async updateSurveyPeriod(
    @Body() dto: UpdateSurveyPeriodRequestDto,
  ): Promise<void> {
    return this.surveyService.updateSurveyPeriod(dto);
  }

  /**
   * 설문 삭제
   */
  @Delete(':surveyId')
  @ApiOperation({ summary: '설문 삭제' })
  async deleteSurvey(
    @Param('surveyId', ParseIntPipe) surveyId: number,
  ): Promise<void> {
    return this.surveyService.deleteSurvey(surveyId);
  }
}