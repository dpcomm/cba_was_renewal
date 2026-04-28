import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Get,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { QuestionService } from '../../application/services/question.service';

import {
  CreateQuestionRequestDto,
  UpdateQuestionRequestDto,
  ReorderQuestionRequestDto,
  GetQuestionRequestDto,
} from '../../application/dto/question.request.dto';

import {
  QuestionDetailResponseDto,
  QuestionSummaryResponseDto,
} from '../dto/question.response.dto';
import { JwtGuard } from '@shared/decorators/jwt-guard.decorator';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { ok } from '@shared/responses/api-response';

@ApiTags('Question')
@Controller('questions')
@JwtGuard()
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  /**
   * 질문 단건 조회 (Edit / Preview 용)
   */
  @Get(':questionId')
  @ApiOperation({ summary: '질문 단건 조회' })
  @ApiSuccessResponse({ type: QuestionDetailResponseDto })
  async getQuestion(
    @Param('questionId', ParseIntPipe) questionId: number,
  ) {
    const result = await this.questionService.getQuestion(questionId);
    return ok(result, 'Success get question');
  }

  @Get('/survey/:surveyId')
  @ApiOperation({ summary: '설문별 질문 조회' })
  async getQuestionsBySurvey(
    @Param('surveyId', ParseIntPipe) surveyId: number,
  ) {
    const result = await this.questionService.getQuestionsBySurvey(surveyId);
    return ok(result, 'Success get question list by survey Id');
  }  

}