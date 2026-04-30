import { Injectable } from '@nestjs/common';
import { Question } from '../../domain/entities/question.entity';
import { QuestionOption } from '../../domain/entities/question_option.entity';

import {
  QuestionSummaryResponseDto,
  QuestionDetailResponseDto,
  QuestionOptionResponseDto,
} from '../../presentation/dto/question.response.dto';

@Injectable()
export class QuestionMapper {
  toSummary(question: Question): QuestionSummaryResponseDto {
    return {
      id: question.id,
      surveyId: question.surveyId,
      title: question.title,
      answerType: question.answerType,
      isRequired: question.isRequired,
      orderNo: question.orderNo,
    };
  }

  toSummaryList(questions: Question[]): QuestionSummaryResponseDto[] {
    return questions.map((question) => this.toSummary(question));
  }

  toDetail(question: Question): QuestionDetailResponseDto {
    const sortedOptions = (question.options || [])
      .slice()
      .sort((a, b) => a.orderNo - b.orderNo);

    return {
      ...this.toSummary(question),
      options: sortedOptions.map((o) => this.toOption(o)),
    };
  }

  private toOption(option: QuestionOption): QuestionOptionResponseDto {
    return {
      id: option.id,
      label: option.label,
      orderNo: option.orderNo,
    };
  }
}