import { Injectable } from '@nestjs/common';
import { Survey } from '@modules/application/domain/entities/survey.entity';

import {
  SurveySummaryResponseDto,
  SurveyResponseDto,
  SurveyPreviewResponseDto,
} from '../dto/response/survey.response.dto';

import { QuestionMapper } from './question.mapper';

@Injectable()
export class SurveyMapper {
  constructor(
    private readonly questionMapper: QuestionMapper,
  ) {}

  toSurveySummary(survey: Survey): SurveySummaryResponseDto {
    return {
      id: survey.id,
      retreatId: survey.retreatId,
      title: survey.title,
      surveyStartAt: survey.surveyStartAt,
      surveyEndAt: survey.surveyEndAt,
    };
  }

  toSurveySummaryList(surveys: Survey[]): SurveySummaryResponseDto[] {
    return surveys.map((s) => this.toSurveySummary(s));
  }

  toSurveyResponse(survey: Survey): SurveyResponseDto {
    const sortedQuestions = (survey.questions || [])
      .slice()
      .sort((a, b) => a.orderNo - b.orderNo);

    return {
      ...this.toSurveySummary(survey),
      questions: sortedQuestions.map((q) =>
        this.questionMapper.toSummary(q),
      ),
    };
  }

  toSurveyPreview(survey: Survey): SurveyPreviewResponseDto {
    const sortedQuestions = (survey.questions || [])
      .slice()
      .sort((a, b) => a.orderNo - b.orderNo);

    return {
      ...this.toSurveySummary(survey),
      questions: sortedQuestions.map((q) =>
        this.questionMapper.toDetail(q),
      ),
    };
  }
}
