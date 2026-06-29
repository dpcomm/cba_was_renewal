import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';

import { Question } from '../../domain/entities/question.entity';
import { QuestionOption } from '../../domain/entities/question_option.entity';
import { Survey } from '../../domain/entities/survey.entity';

import {
  CreateQuestionRequestDto,
  UpdateQuestionRequestDto,
  ReorderQuestionRequestDto,
} from '../../presentation/dto/request/question.request.dto';

import { AnswerType } from '@modules/application/domain/enum/survey.enum';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,

    @InjectRepository(QuestionOption)
    private readonly optionRepository: Repository<QuestionOption>,

    @InjectRepository(Survey)
    private readonly surveyRepository: Repository<Survey>,

    private readonly dataSource: DataSource,
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
      throw new NotFoundException(ERROR_MESSAGES.SURVEY_NOT_FOUND);
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

    return question;
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
      throw new NotFoundException(ERROR_MESSAGES.QUESTION_NOT_FOUND);
    }

    return question;
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

    return questions;

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
      throw new NotFoundException(ERROR_MESSAGES.QUESTION_NOT_FOUND);
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
    await this.dataSource.transaction(async (manager) => {
      const questions = await manager.find(Question, {
        where: {
          surveyId: dto.surveyId,
          id: In(dto.questionIds),
        },
      });

      if (questions.length !== dto.questionIds.length) {
        throw new BadRequestException(ERROR_MESSAGES.INVALID_QUESTION_ID);
      }

      // 1️⃣ 충돌 방지용 임시 이동
      await manager
        .createQueryBuilder()
        .update(Question)
        .set({
          orderNo: () => 'order_no + 1000',
        })
        .where('survey_id = :surveyId', { surveyId: dto.surveyId })
        .execute();

      // 2️⃣ 순서 재정렬
      for (let i = 0; i < dto.questionIds.length; i++) {
        await manager
          .createQueryBuilder()
          .update(Question)
          .set({ orderNo: i + 1 })
          .where('id = :id', { id: dto.questionIds[i] })
          .execute();
      }
    });
  }

  /**
   * 질문 삭제
   */
  async deleteQuestion(questionId: number): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const question = await manager.findOne(Question, {
        where: { id: questionId },
      });

      if (!question) {
        throw new NotFoundException(ERROR_MESSAGES.QUESTION_NOT_FOUND);
      }

      try {
        await manager.delete(QuestionOption, { questionId });
        await manager.delete(Question, { id: questionId });
      } catch (e) {
        console.error('DELETE ERROR:', e);
        throw e;
      }
    });
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
          ERROR_MESSAGES.INVALID_QUESTION_OPTIONS_FOR_SUBJECTIVE,
        );
      }
      return;
    }

    // 선택형은 옵션 필수
    if (!options || options.length === 0) {
      throw new BadRequestException(
        ERROR_MESSAGES.QUESTION_OPTIONS_REQUIRED,
      );
    }

    // 중복 체크 (MULTI_SELECT)
    const labels = options.map((o) => o.label);
    const unique = new Set(labels);

    if (unique.size !== labels.length) {
      throw new BadRequestException(ERROR_MESSAGES.DUPLICATE_QUESTION_OPTION_LABELS);
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
