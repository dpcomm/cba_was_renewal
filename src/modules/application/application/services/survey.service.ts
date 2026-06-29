import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Survey } from '../../domain/entities/survey.entity';
import { Retreat } from '@modules/retreat/domain/entities/retreat.entity';

import {
  CreateSurveyRequestDto,
  UpdateSurveyPeriodRequestDto,
} from '../../presentation/dto/request/survey.request.dto';

import { ERROR_MESSAGES } from '@shared/constants/error-messages';

@Injectable()
export class SurveyService {
  constructor(
    @InjectRepository(Survey)
    private readonly surveyRepository: Repository<Survey>,

    @InjectRepository(Retreat)
    private readonly retreatRepository: Repository<Retreat>,
  ) {}

  /**
   * 수련회별 설문 조회 (summary)
   */
  async getSurveyByRetreat(retreatId: number): Promise<Survey[]> {
    return this.surveyRepository.find({
      where: { retreatId },
      order: { surveyStartAt: 'DESC' },
    });
  }

  /**
   * 설문 상세 조회 (질문 리스트 포함)
   */
  async getSurvey(surveyId: number): Promise<Survey> {
    const survey = await this.surveyRepository.findOne({
      where: { id: surveyId },
      relations: ['questions'],
    });

    if (!survey) {
      throw new NotFoundException(ERROR_MESSAGES.SURVEY_NOT_FOUND);
    }

    return survey;
  }

  /**
   * 설문 미리보기 (질문 + 옵션 포함)
   */
  async previewSurvey(surveyId: number): Promise<Survey> {
    const survey = await this.surveyRepository.findOne({
      where: { id: surveyId },
      relations: ['questions', 'questions.options'],
    });

    if (!survey) {
      throw new NotFoundException(ERROR_MESSAGES.SURVEY_NOT_FOUND);
    }

    return survey;
  }

  /**
   * 설문 생성
   */
  async createSurvey(dto: CreateSurveyRequestDto): Promise<Survey> {
    const retreat = await this.retreatRepository.findOne({
      where: { id: dto.retreatId },
    });

    if (!retreat) {
      throw new NotFoundException(ERROR_MESSAGES.RETREAT_NOT_FOUND);
    }

    const survey = this.surveyRepository.create({
      retreatId: dto.retreatId,
      title: `${retreat.title} 신청서`,
      surveyStartAt: new Date(dto.surveyStartAt),
      surveyEndAt: new Date(dto.surveyEndAt),
    });

    return this.surveyRepository.save(survey);
  }

  /**
   * 설문 기간 수정
   */
  async updateSurveyPeriod(
    dto: UpdateSurveyPeriodRequestDto,
  ): Promise<void> {
    const survey = await this.surveyRepository.findOne({
      where: { id: dto.surveyId },
    });

    if (!survey) {
      throw new NotFoundException(ERROR_MESSAGES.SURVEY_NOT_FOUND);
    }

    survey.surveyStartAt = new Date(dto.surveyStartAt);
    survey.surveyEndAt = new Date(dto.surveyEndAt);

    await this.surveyRepository.save(survey);
  }

  /**
   * 설문 삭제
   */
  async deleteSurvey(surveyId: number): Promise<void> {
    const survey = await this.surveyRepository.findOne({
      where: { id: surveyId },
    });

    if (!survey) {
      throw new NotFoundException(ERROR_MESSAGES.SURVEY_NOT_FOUND);
    }

    /**
     * TODO:
     * - application 존재 여부 확인
     * - soft delete (isActive) 전환
     */
    await this.surveyRepository.delete(surveyId);
  }
}
