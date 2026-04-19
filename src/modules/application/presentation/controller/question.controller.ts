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

@ApiTags('Question')
@Controller('questions')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  /**
   * 질문 생성
   */
  @Post()
  @ApiOperation({ summary: '질문 생성' })
  @ApiResponse({ type: QuestionSummaryResponseDto })
  async createQuestion(
    @Body() dto: CreateQuestionRequestDto,
  ): Promise<QuestionSummaryResponseDto> {
    return this.questionService.createQuestion(dto);
  }

  /**
   * 질문 수정 (옵션 포함)
   */
  @Patch()
  @ApiOperation({ summary: '질문 수정' })
  @ApiResponse({ type: QuestionSummaryResponseDto })
  async updateQuestion(
    @Body() dto: UpdateQuestionRequestDto,
  ): Promise<void> {
    return this.questionService.updateQuestion(dto);
  }

  /**
   * 질문 순서 변경
   */
  @Patch('reorder')
  @ApiOperation({ summary: '질문 순서 변경' })
  async reorderQuestions(
    @Body() dto: ReorderQuestionRequestDto,
  ): Promise<void> {
    return this.questionService.reorderQuestions(dto);
  }

  /**
   * 질문 단건 조회 (Edit / Preview 용)
   */
  @Get(':questionId')
  @ApiOperation({ summary: '질문 단건 조회' })
  @ApiResponse({ type: QuestionDetailResponseDto })
  async getQuestion(
    @Param('questionId', ParseIntPipe) questionId: number,
  ): Promise<QuestionDetailResponseDto | null> {
    return this.questionService.getQuestion(questionId);
  }

  @Get('/survey/:surveyId')
  @ApiOperation({ summary: '설문별 질문 조회' })
  async getQuestionsBySurvey(
    @Param('surveyId', ParseIntPipe) surveyId: number,
  ) {
    return this.questionService.getQuestionsBySurvey(surveyId);
  }  

  /**
   * 질문 삭제
   */
  @Delete(':questionId')
  @ApiOperation({ summary: '질문 삭제' })
  async deleteQuestion(
    @Param('questionId', ParseIntPipe) questionId: number,
  ): Promise<void> {
    return this.questionService.deleteQuestion(questionId);
  }
}