import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { Question } from '../../domain/entities/question.entity';
import { QuestionOption } from '../../domain/entities/question_option.entity';
import { Survey } from '../../domain/entities/survey.entity';

import {
  CreateQuestionRequestDto,
  UpdateQuestionRequestDto,
  ReorderQuestionRequestDto,
} from '../dto/question.request.dto';

import { QuestionMapper } from '../mappers/question.mapper';
import { AnswerType } from '@modules/application/domain/enum/survey.enum';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,

    @InjectRepository(QuestionOption)
    private readonly optionRepository: Repository<QuestionOption>,

    @InjectRepository(Survey)
    private readonly surveyRepository: Repository<Survey>,

    private readonly mapper: QuestionMapper,
  ) {}

  /**
   * 질문 생성 (옵션 포함)
   */
  async createQuestion(dto: CreateQuestionRequestDto) {
    const survey = await this.surveyRepository.findOne({
      where: { id: dto.surveyId },
      relations: ['questions'],
    });

    if (!survey) {
      throw new NotFoundException('Survey not found');
    }

    this.validateOptions(dto.answerType, dto.options);

    const orderNo = (survey.questions?.length || 0) + 1;

    const question = await this.questionRepository.save(
      this.questionRepository.create({
        surveyId: dto.surveyId,
        title: dto.title,
        answerType: dto.answerType,
        isRequired: dto.isRequired,
        orderNo,
      }),
    );

    if (dto.options?.length) {
      await this.syncOptions(question.id, dto.options);
    }

    return this.mapper.toSummary(question);
  }

  async getQuestion(questionId: number) {
    const question = await this.questionRepository.findOne({
      where: { id: questionId },
      relations: ['options'],
      order: {
        options: {
            orderNo: 'ASC',
        },
      },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return this.mapper.toDetail(question);
  }
  
  async getQuestionsBySurvey(surveyId: number) {
    const questions = await this.questionRepository.find({
      where: { surveyId },
      relations: ['options'],
      order: {
        orderNo: 'ASC',
        options: {
          orderNo: 'ASC',
        },
      },
    });

    return this.mapper.toSummaryList(questions);

  }
  /**
   * 질문 수정 (옵션 포함)
   */
  async updateQuestion(dto: UpdateQuestionRequestDto): Promise<void> {
    const question = await this.questionRepository.findOne({
      where: { id: dto.questionId },
      relations: ['options'],
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    const nextAnswerType = dto.answerType ?? question.answerType;

    this.validateOptions(nextAnswerType, dto.options);

    question.title = dto.title ?? question.title;
    question.answerType = nextAnswerType;
    question.isRequired = dto.isRequired ?? question.isRequired;

    await this.questionRepository.save(question);

    if (dto.options) {
      await this.syncOptions(question.id, dto.options);
    }
  }

  /**
   * 질문 순서 변경
   */
  async reorderQuestions(dto: ReorderQuestionRequestDto): Promise<void> {
    const questions = await this.questionRepository.find({
      where: {
        surveyId: dto.surveyId,
        id: In(dto.questionIds),
      },
    });

    if (questions.length !== dto.questionIds.length) {
      throw new BadRequestException('Invalid questionIds');
    }

    // 1️⃣ 먼저 충돌 안 나는 값으로 이동
    await this.questionRepository.query(
      `
      UPDATE Question
      SET order_no = order_no + 1000
      WHERE survey_id = ?
      `,
      [dto.surveyId],
    );

    // 2️⃣ 정상 순서로 재정렬
    await this.questionRepository.query(
      `
      UPDATE Question
      SET order_no = CASE id
        ${dto.questionIds
          .map((id, idx) => `WHEN ${id} THEN ${idx + 1}`)
          .join(' ')}
      END
      WHERE id IN (${dto.questionIds.join(',')})
      `,
    );
  }
  /**
   * 질문 삭제
   */
  async deleteQuestion(questionId: number): Promise<void> {
    const question = await this.questionRepository.findOne({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    // 🔥 먼저 옵션 삭제
    await this.optionRepository.delete({ questionId });

    // 🔥 그 다음 질문 삭제
    await this.questionRepository.delete(questionId);
  }

  // =========================
  // 🔥 핵심 로직
  // =========================

  /**
   * 옵션 검증
   */
  private validateOptions(
    answerType: AnswerType,
    options?: { label: string }[],
  ) {
    if (answerType === AnswerType.SUBJECTIVE) {
      if (options && options.length > 0) {
        throw new BadRequestException(
          'SUBJECTIVE type cannot have options',
        );
      }
      return;
    }

    // 선택형은 옵션 필수
    if (!options || options.length === 0) {
      throw new BadRequestException(
        'Options are required for select type',
      );
    }

    // 중복 체크 (MULTI_SELECT)
    const labels = options.map((o) => o.label);
    const unique = new Set(labels);

    if (unique.size !== labels.length) {
      throw new BadRequestException('Duplicate option labels');
    }
  }

  /**
   * 옵션 동기화 (생성 / 수정 / 삭제 / 정렬)
   */
  private async syncOptions(
    questionId: number,
    options: { id?: number; label: string }[],
  ) {
    const existing = await this.optionRepository.find({
      where: { questionId },
    });

    const existingMap = new Map(existing.map((o) => [o.id, o]));

    const toSave: QuestionOption[] = [];

    for (let i = 0; i < options.length; i++) {
      const opt = options[i];

      if (opt.id && existingMap.has(opt.id)) {
        const entity = existingMap.get(opt.id)!;
        entity.label = opt.label;
        entity.orderNo = i + 1;
        toSave.push(entity);
        existingMap.delete(opt.id);
      } else {
        toSave.push(
          this.optionRepository.create({
            questionId,
            label: opt.label,
            orderNo: i + 1,
          }),
        );
      }
    }

    const toDelete = [...existingMap.keys()];

    if (toDelete.length) {
      await this.optionRepository.delete(toDelete);
    }

    await this.optionRepository.save(toSave);
  }
}