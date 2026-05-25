import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SurveyService } from '../../application/services/survey.service';
import {
  CreateSurveyRequestDto,
  UpdateSurveyPeriodRequestDto,
} from '../dto/request/survey.request.dto';
import { SurveySummaryResponseDto } from '../dto/response/survey.response.dto';
import { JwtGuard } from '@shared/decorators/jwt-guard.decorator';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { RankGuard } from '@shared/decorators/rank-guard.decorator';
import { UserRank } from '@modules/user/domain/enums/user-rank.enum';
import { ok } from '@shared/responses/api-response';

@ApiTags('Admin Survey')
@Controller('admin/surveys')
@RankGuard(UserRank.ADMIN)
@JwtGuard()
export class AdminSurveyController {
  constructor(private readonly surveyService: SurveyService) {}

  @Post()
  @ApiOperation({ summary: '설문 생성' })
  @ApiSuccessResponse({ type: SurveySummaryResponseDto })
  async createSurvey(@Body() dto: CreateSurveyRequestDto) {
    const result = await this.surveyService.createSurvey(dto);
    return ok(result, 'Success crete survey');
  }

  @Patch()
  @ApiOperation({ summary: '설문 기간 수정' })
  async updateSurveyPeriod(@Body() dto: UpdateSurveyPeriodRequestDto) {
    await this.surveyService.updateSurveyPeriod(dto);
    return ok(null, 'Success update survey period');
  }

  @Delete(':surveyId')
  @ApiOperation({ summary: '설문 삭제' })
  async deleteSurvey(@Param('surveyId', ParseIntPipe) surveyId: number) {
    await this.surveyService.deleteSurvey(surveyId);
    return ok(null, 'Success delete survey');
  }
}
