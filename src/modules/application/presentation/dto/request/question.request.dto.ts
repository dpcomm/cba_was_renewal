import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { AnswerType } from '@modules/application/domain/enum/survey.enum';


class OptionDto {
  @ApiProperty({
    description: '옵션 ID (수정 시 사용)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty({
    description: '옵션 내용',
    example: '참석',
  })
  @IsString()
  label: string;
}

/**
 * 질문 생성
 */
export class CreateQuestionRequestDto {
  @ApiProperty({
    description: '설문 ID',
    example: 1,
  })
  @IsNumber()
  surveyId: number;

  @ApiProperty({
    description: '질문 제목',
    example: '수련회에 참석하시겠습니까?',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: '답변 타입',
    enum: AnswerType,
    example: AnswerType.SINGLE_SELECT,
  })
  @IsEnum(AnswerType)
  answerType: AnswerType;

  @ApiProperty({
    description: '필수 여부',
    example: true,
  })
  @IsBoolean()
  isRequired: boolean;

  @ApiProperty({
    description: '옵션 목록 (선택형일 때만 필요)',
    type: [OptionDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  options?: OptionDto[];

}

/**
 * 질문 수정
 */
export class UpdateQuestionRequestDto {
  @ApiProperty({
    description: '질문 ID',
    example: 10,
  })
  @IsNumber()
  questionId: number;

  @ApiProperty({
    description: '질문 제목',
    example: '수련회에 참석하시겠습니까?',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: '답변 타입',
    enum: AnswerType,
    required: false,
  })
  @IsOptional()
  @IsEnum(AnswerType)
  answerType?: AnswerType;

  @ApiProperty({
    description: '필수 여부',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiProperty({
    description: `
옵션 전체 교체
- 전달되면 기존 옵션은 모두 대체됨
- 전달되지 않으면 옵션 변경 없음
    `,
    type: [OptionDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  options?: OptionDto[];  
}

/**
 * 질문 순서 변경
 */
export class ReorderQuestionRequestDto {
  @ApiProperty({
    description: '설문 ID',
    example: 1,
  })
  @IsNumber()
  surveyId: number;

  @ApiProperty({
    description: '정렬 순서대로 정렬된 질문 ID 목록',
    example: [3, 1, 2],
    type: [Number],
  })
  @IsArray()
  @IsNumber({}, { each: true })
  questionIds: number[];
}

/**
 * 질문 단건 조회 (Edit용)
 */
export class GetQuestionRequestDto {
  @ApiProperty({
    description: '질문 ID',
    example: 10,
  })
  @IsNumber()
  questionId: number;
}

/**
 * 질문 삭제
 */
export class DeleteQuestionRequestDto {
  @ApiProperty({
    description: '질문 ID',
    example: 10,
  })
  @IsNumber()
  questionId: number;
}
