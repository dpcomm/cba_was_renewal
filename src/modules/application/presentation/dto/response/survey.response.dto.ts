import { ApiProperty } from '@nestjs/swagger';
import {
  QuestionSummaryResponseDto,
  QuestionDetailResponseDto,
} from './question.response.dto';

/**
 * 설문 요약 DTO (목록용)
 */
export class SurveySummaryResponseDto {
  @ApiProperty({
    description: '설문 ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: '수련회 ID',
    example: 100,
  })
  retreatId: number;

  @ApiProperty({
    description: '설문 제목',
    example: '2026 겨울 수련회 신청서',
  })
  title: string;

  @ApiProperty({
    description: '설문 시작 시간',
    example: '2026-05-01T00:00:00.000Z',
  })
  surveyStartAt: Date;

  @ApiProperty({
    description: '설문 종료 시간',
    example: '2026-05-10T23:59:59.000Z',
  })
  surveyEndAt: Date;
}

/**
 * 설문 상세 DTO (관리용)
 * → 질문만 포함 (option 없음)
 */
export class SurveyResponseDto extends SurveySummaryResponseDto {
  @ApiProperty({
    description: '질문 목록 (옵션 제외)',
    type: [QuestionSummaryResponseDto],
  })
  questions: QuestionSummaryResponseDto[];
}

/**
 * 설문 미리보기 DTO (사용자 응답용)
 * → 질문 + 옵션 포함
 */
export class SurveyPreviewResponseDto extends SurveySummaryResponseDto {
  @ApiProperty({
    description: '질문 목록 (옵션 포함)',
    type: [QuestionDetailResponseDto],
  })
  questions: QuestionDetailResponseDto[];
}

/**
 * 응답 타입 (선택)
 */
export type SurveyListResponse = SurveySummaryResponseDto[];
export type SurveySingleResponse = SurveyResponseDto | null;
export type SurveyPreviewResponse = SurveyPreviewResponseDto;
