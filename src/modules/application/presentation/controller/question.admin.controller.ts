import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { QuestionService } from '../../application/services/question.service';
import {
  CreateQuestionRequestDto,
  UpdateQuestionRequestDto,
  ReorderQuestionRequestDto,
} from '../dto/request/question.request.dto';
import { QuestionSummaryResponseDto } from '../dto/response/question.response.dto';
import { JwtGuard } from '@shared/decorators/jwt-guard.decorator';
import { RankGuard } from '@shared/decorators/rank-guard.decorator';
import { ApiSuccessResponse } from '@shared/decorators/api-success-response.decorator';
import { UserRank } from '@modules/user/domain/enums/user-rank.enum';
import { ok } from '@shared/responses/api-response';

@ApiTags('Admin Question')
@Controller('admin/questions')
@RankGuard(UserRank.ADMIN)
@JwtGuard()
export class AdminQuestionController {
  constructor(private readonly questionService: QuestionService) {}

  /**
   * 질문 생성
   */
  @Post()
  @ApiOperation({ summary: '질문 생성' })
  @ApiSuccessResponse({ type: QuestionSummaryResponseDto })
  async createQuestion(@Body() dto: CreateQuestionRequestDto) {
    const result = await this.questionService.createQuestion(dto);
    return ok(result, 'Success create question');
  }

  /**
   * 질문 수정
   */
  @Patch()
  @ApiOperation({ summary: '질문 수정' })
  async updateQuestion(@Body() dto: UpdateQuestionRequestDto) {
    await this.questionService.updateQuestion(dto);
    return ok(null, 'Success update question');
  }

  /**
   * 질문 순서 변경
   */
  @Patch('reorder')
  @ApiOperation({ summary: '질문 순서 변경' })
  async reorderQuestions(@Body() dto: ReorderQuestionRequestDto) {
    await this.questionService.reorderQuestions(dto);
    return ok(null, 'Success reorder question');
  }

  /**
   * 질문 삭제
   */
  @Delete(':questionId')
  @ApiOperation({ summary: '질문 삭제' })
  async deleteQuestion(@Param('questionId', ParseIntPipe) questionId: number) {
    await this.questionService.deleteQuestion(questionId);
    return ok(null, 'Success delete question');
  }
}
