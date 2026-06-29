import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SurveyService } from '../../application/services/survey.service';
import {
  SurveySummaryResponseDto,
  SurveyResponseDto,
  SurveyPreviewResponseDto,
} from '../dto/response/survey.response.dto';
import { JwtGuard } from '@shared/decorators/jwt-guard.decorator';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { ok } from '@shared/responses/api-response';
import { SurveyMapper } from '../mappers/survey.mapper';

@ApiTags('Survey')
@Controller('surveys')
@JwtGuard()
export class SurveyController {
  constructor(
    private readonly surveyService: SurveyService,
    private readonly surveyMapper: SurveyMapper,
  ) {}

  /**
   * 수련회별 설문 조회 (summary)
   */
  @Get('retreat/:retreatId')
  @ApiOperation({ summary: '수련회별 설문 조회' })
  @ApiSuccessResponse({ type: SurveySummaryResponseDto, isArray: true })
  async getSurveyByRetreat(
    @Param('retreatId', ParseIntPipe) retreatId: number,
  ) {
    const surveys = await this.surveyService.getSurveyByRetreat(retreatId);
    const result = this.surveyMapper.toSurveySummaryList(surveys);
    return ok(result, 'Success get survey list by retreatId');
  }

  /**
   * 설문 상세 조회 (관리용: 질문만 포함)
   */
  @Get(':surveyId')
  @ApiOperation({ summary: '설문 상세 조회 (질문 포함)' })
  @ApiSuccessResponse({ type: SurveyResponseDto })
  async getSurvey(@Param('surveyId', ParseIntPipe) surveyId: number) {
    const survey = await this.surveyService.getSurvey(surveyId);
    const result = this.surveyMapper.toSurveyResponse(survey);
    return ok(result, 'Success get survey detail by surveyId');
  }

  /**
   * 설문 미리보기 (질문 + 옵션 포함)
   */
  @Get(':surveyId/preview')
  @ApiOperation({ summary: '설문 미리보기 (옵션 포함)' })
  @ApiSuccessResponse({ type: SurveyPreviewResponseDto })
  async previewSurvey(@Param('surveyId', ParseIntPipe) surveyId: number) {
    const survey = await this.surveyService.previewSurvey(surveyId);
    const result = this.surveyMapper.toSurveyPreview(survey);
    return ok(result, 'Success get survey overview');
  }
}
