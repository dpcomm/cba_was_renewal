import { ApiProperty } from '@nestjs/swagger';
import { AnswerType } from '@modules/application/domain/enum/survey.enum';

/**
 * 옵션 DTO (detail에서만 사용)
 */
export class QuestionOptionResponseDto {
  @ApiProperty({
    description: '옵션 ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: '옵션 내용',
    example: '참석',
  })
  label: string;

  @ApiProperty({
    description: '옵션 정렬 순서',
    example: 1,
  })
  orderNo: number;
}

/**
 * 질문 요약 DTO (Survey 조회, 단순 질문 목록 조회용)
 */
export class QuestionSummaryResponseDto {
  @ApiProperty({
    description: '질문 ID',
    example: 10,
  })
  id: number;

  @ApiProperty({
    description: '설문 ID',
    example: 1,
  })
  surveyId: number;

  @ApiProperty({
    description: '질문 제목',
    example: '수련회에 참석하시겠습니까?',
  })
  title: string;

  @ApiProperty({
    description: '답변 타입',
    enum: AnswerType,
    example: AnswerType.SINGLE_SELECT,
  })
  answerType: AnswerType;

  @ApiProperty({
    description: '필수 여부',
    example: true,
  })
  isRequired: boolean;

  @ApiProperty({
    description: '질문 정렬 순서',
    example: 1,
  })
  orderNo: number;
}

/**
 * 질문 상세 DTO (미리보기 / 응답용)
 */
export class QuestionDetailResponseDto extends QuestionSummaryResponseDto {
  @ApiProperty({
    description: '객관식 보기 목록 (SINGLE_SELECT, MULTI_SELECT에서만 사용)',
    type: [QuestionOptionResponseDto],
    required: false,
  })
  options?: QuestionOptionResponseDto[];
}

/**
 * 응답 타입 (선택)
 */
export type QuestionListResponse = QuestionSummaryResponseDto[];
export type QuestionSingleResponse = QuestionDetailResponseDto | null;