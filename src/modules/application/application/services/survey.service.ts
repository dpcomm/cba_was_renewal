import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Survey } from '../../domain/entities/survey.entity';

import {
  CreateSurveyRequestDto,
  UpdateSurveyPeriodRequestDto,
} from '../dto/survey.request.dto';

import {
  SurveySummaryResponseDto,
  SurveyResponseDto,
  SurveyPreviewResponseDto,
} from '../../presentation/dto/survey.response.dto';

import { SurveyMapper } from '../mappers/survey.mapper';

@Injectable()
export class SurveyService {
  constructor(
    @InjectRepository(Survey)
    private readonly surveyRepository: Repository<Survey>,

    private readonly mapper: SurveyMapper,
  ) {}

  /**
   * 수련회별 설문 조회 (summary)
   */
  async getSurveyByRetreat(
    retreatId: number,
  ): Promise<SurveySummaryResponseDto[]> {
    const surveys = await this.surveyRepository.find({
      where: { retreatId },
      order: { surveyStartAt: 'DESC' },
    });

    return this.mapper.toSurveySummaryList(surveys);
  }

  /**
   * 설문 상세 조회 (질문 리스트 포함)
   */
  async getSurvey(
    surveyId: number,
  ): Promise<SurveyResponseDto> {
    const survey = await this.surveyRepository.findOne({
      where: { id: surveyId },
      relations: ['questions'],
    });

    if (!survey) {
      throw new NotFoundException('Survey not found');
    }

    return this.mapper.toSurveyResponse(survey);
  }

  /**
   * 설문 미리보기 (질문 + 옵션 포함)
   */
  async previewSurvey(
    surveyId: number,
  ): Promise<SurveyPreviewResponseDto> {
    const survey = await this.surveyRepository.findOne({
      where: { id: surveyId },
      relations: ['questions', 'questions.options'],
    });

    if (!survey) {
      throw new NotFoundException('Survey not found');
    }

    return this.mapper.toSurveyPreview(survey);
  }

  /**
   * 설문 생성
   */
  async createSurvey(
    dto: CreateSurveyRequestDto,
  ): Promise<SurveySummaryResponseDto> {
    const survey = this.surveyRepository.create({
      retreatId: dto.retreatId,
      surveyStartAt: new Date(dto.surveyStartAt),
      surveyEndAt: new Date(dto.surveyEndAt),
    });

    const saved = await this.surveyRepository.save(survey);

    return this.mapper.toSurveySummary(saved);
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
      throw new NotFoundException('Survey not found');
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
      throw new NotFoundException('Survey not found');
    }

    /**
     * TODO:
     * - application 존재 여부 확인
     * - soft delete (isActive) 전환
     */
    await this.surveyRepository.delete(surveyId);
  }
}