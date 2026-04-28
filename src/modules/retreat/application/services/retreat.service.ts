import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Retreat } from '@modules/retreat/domain/entities/retreat.entity';
import {
  CreateRetreatRequestDto,
  UpdateRetreatRequestDto,
} from '../dto/retreat.request.dto';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';

@Injectable()
export class RetreatService {
  private readonly logger = new Logger(RetreatService.name);

  constructor(
    @InjectRepository(Retreat)
    private readonly retreatRepository: Repository<Retreat>,
  ) {}

  async getAllRetreats(): Promise<Retreat[]> {
    return await this.retreatRepository.find({
      order: {
        retreatStartAt: 'DESC',
      },
    });
  }

  async getRetreatById(id: number): Promise<Retreat> {
    const retreat = await this.retreatRepository.findOne({
      where: { id },
    });

    if (!retreat) {
      throw new NotFoundException(ERROR_MESSAGES.RETREAT_NOT_FOUND);
    }

    return retreat;
  }

  async createRetreat(dto: CreateRetreatRequestDto): Promise<Retreat> {
    const retreat = this.retreatRepository.create({
      title: dto.title,
      location: dto.location,
      retreatStartAt: new Date(dto.retreatStartAt),
      retreatEndAt: new Date(dto.retreatEndAt),
    });

    const savedRetreat = await this.retreatRepository.save(retreat);
    this.logger.log(`수련회 생성 완료 - ID: ${savedRetreat.id}`);
    return savedRetreat;
  }

  async updateRetreat(dto: UpdateRetreatRequestDto): Promise<Retreat> {
    const retreat = await this.getRetreatById(dto.id);

    if (dto.title !== undefined) retreat.title = dto.title;
    if (dto.location !== undefined) retreat.location = dto.location;
    if (dto.retreatStartAt !== undefined)
      retreat.retreatStartAt = new Date(dto.retreatStartAt);
    if (dto.retreatEndAt !== undefined)
      retreat.retreatEndAt = new Date(dto.retreatEndAt);

    const updatedRetreat = await this.retreatRepository.save(retreat);
    this.logger.log(`수련회 수정 완료 - ID: ${updatedRetreat.id}`);
    return updatedRetreat;
  }

  async deleteRetreat(id: number): Promise<void> {
    const retreat = await this.getRetreatById(id);
    await this.retreatRepository.remove(retreat);
    this.logger.log(`수련회 삭제 완료 - ID: ${id}`);
  }
}
