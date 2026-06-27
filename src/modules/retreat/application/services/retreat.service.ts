import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Retreat } from '@modules/retreat/domain/entities/retreat.entity';
import { Survey } from '@modules/application/domain/entities/survey.entity';
import {
  CreateRetreatRequestDto,
  UpdateRetreatRequestDto,
} from '../../presentation/dto/request/retreat.request.dto';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';

@Injectable()
export class RetreatService {
  private readonly logger = new Logger(RetreatService.name);

  constructor(
    @InjectRepository(Retreat)
    private readonly retreatRepository: Repository<Retreat>,
    private readonly dataSource: DataSource,
  ) {}

  async getAllRetreats(): Promise<Retreat[]> {
    return await this.retreatRepository.find({
      relations: ['surveys'],
      order: {
        retreatStartAt: 'DESC',
      },
    });
  }

  async getRetreatById(id: number): Promise<Retreat> {
    const retreat = await this.retreatRepository.findOne({
      where: { id },
      relations: ['surveys'],
    });

    if (!retreat) {
      throw new NotFoundException(ERROR_MESSAGES.RETREAT_NOT_FOUND);
    }

    return retreat;
  }

  async createRetreat(dto: CreateRetreatRequestDto): Promise<Retreat> {
    this.validateDateRange(dto.retreatStartAt, dto.retreatEndAt, '수련회');
    this.validateDateRange(dto.surveyStartAt, dto.surveyEndAt, '신청서');

    const { retreat, survey } = await this.dataSource.transaction(
      async (manager) => {
        const newRetreat = manager.create(Retreat, {
          title: dto.title,
          location: dto.location,
          address: dto.address,
          retreatStartAt: new Date(dto.retreatStartAt),
          retreatEndAt: new Date(dto.retreatEndAt),
        });

        const savedRetreat = await manager.save(Retreat, newRetreat);

        const newSurvey = manager.create(Survey, {
          retreatId: savedRetreat.id,
          title: `${savedRetreat.title} 신청서`,
          surveyStartAt: new Date(dto.surveyStartAt),
          surveyEndAt: new Date(dto.surveyEndAt),
        });

        const savedSurvey = await manager.save(Survey, newSurvey);

        return { retreat: savedRetreat, survey: savedSurvey };
      },
    );

    retreat.surveys = [survey];
    this.logger.log(`수련회 생성 완료 - ID: ${retreat.id}`);
    return retreat;
  }

  async updateRetreat(dto: UpdateRetreatRequestDto): Promise<Retreat> {
    const retreat = await this.getRetreatById(dto.id);

    const nextRetreatStartAt =
      dto.retreatStartAt ?? retreat.retreatStartAt.toISOString();
    const nextRetreatEndAt =
      dto.retreatEndAt ?? retreat.retreatEndAt.toISOString();
    this.validateDateRange(nextRetreatStartAt, nextRetreatEndAt, '수련회');

    const representativeSurvey = this.getRepresentativeSurvey(retreat);
    const shouldUpdateSurveyPeriod =
      dto.surveyStartAt !== undefined || dto.surveyEndAt !== undefined;
    const shouldSaveSurvey =
      shouldUpdateSurveyPeriod ||
      (dto.title !== undefined && representativeSurvey !== undefined);

    if (shouldUpdateSurveyPeriod) {
      const nextSurveyStartAt =
        dto.surveyStartAt ?? representativeSurvey?.surveyStartAt.toISOString();
      const nextSurveyEndAt =
        dto.surveyEndAt ?? representativeSurvey?.surveyEndAt.toISOString();

      if (!nextSurveyStartAt || !nextSurveyEndAt) {
        throw new BadRequestException('Survey period is required');
      }

      this.validateDateRange(nextSurveyStartAt, nextSurveyEndAt, '신청서');
    }

    const updatedRetreat = await this.dataSource.transaction(
      async (manager) => {
        if (dto.title !== undefined) retreat.title = dto.title;
        if (dto.location !== undefined) retreat.location = dto.location;
        if (dto.address !== undefined) retreat.address = dto.address;
        if (dto.retreatStartAt !== undefined)
          retreat.retreatStartAt = new Date(dto.retreatStartAt);
        if (dto.retreatEndAt !== undefined)
          retreat.retreatEndAt = new Date(dto.retreatEndAt);

        const savedRetreat = await manager.save(Retreat, retreat);

        if (shouldSaveSurvey) {
          let survey = representativeSurvey;

          if (!survey) {
            survey = manager.create(Survey, {
              retreatId: savedRetreat.id,
              title: `${savedRetreat.title} 신청서`,
              surveyStartAt: new Date(dto.surveyStartAt!),
              surveyEndAt: new Date(dto.surveyEndAt!),
            });
          } else {
            if (dto.title !== undefined) {
              survey.title = `${savedRetreat.title} 신청서`;
            }
            if (dto.surveyStartAt !== undefined) {
              survey.surveyStartAt = new Date(dto.surveyStartAt);
            }
            if (dto.surveyEndAt !== undefined) {
              survey.surveyEndAt = new Date(dto.surveyEndAt);
            }
          }

          const savedSurvey = await manager.save(Survey, survey);
          savedRetreat.surveys = [savedSurvey];
        } else {
          savedRetreat.surveys = retreat.surveys;
        }

        return savedRetreat;
      },
    );

    this.logger.log(`수련회 수정 완료 - ID: ${updatedRetreat.id}`);
    return updatedRetreat;
  }

  async deleteRetreat(id: number): Promise<void> {
    const retreat = await this.getRetreatById(id);
    await this.retreatRepository.remove(retreat);
    this.logger.log(`수련회 삭제 완료 - ID: ${id}`);
  }

  private getRepresentativeSurvey(retreat: Retreat): Survey | undefined {
    return retreat.surveys?.slice().sort((a, b) => a.id - b.id)[0];
  }

  private validateDateRange(
    startAt: string,
    endAt: string,
    label: string,
  ): void {
    if (new Date(startAt).getTime() > new Date(endAt).getTime()) {
      throw new BadRequestException(
        `${label} 시작 일시는 종료 일시보다 늦을 수 없습니다`,
      );
    }
  }
}
