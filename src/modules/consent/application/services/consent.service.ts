import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Consent } from '../../domain/entities/consent.entity';
import { CreateConsentDto } from '../dto/create-consent.dto';
import { User } from '@modules/user/domain/entities/user.entity';
import { ConsentType } from '../../domain/consent-type.enum';
import { ERROR_MESSAGES } from '../../../../shared/constants/error-messages';

@Injectable()
export class ConsentService {
  constructor(
    @InjectRepository(Consent)
    private readonly consentRepository: Repository<Consent>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // ... (findAll and findOne unchanged)

  async findAll(): Promise<Consent[]> {
    return this.consentRepository.find({ order: { consentedAt: 'DESC' } });
  }

  async findOne(
    userId: number,
    consentType: ConsentType,
  ): Promise<Consent | null> {
    return this.consentRepository.findOne({ where: { userId, consentType } });
  }

  async create(dto: CreateConsentDto): Promise<Consent> {
    const user = await this.userRepository.findOne({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    const consent = this.consentRepository.create({
      userId: user.id,
      consentType: dto.consentType,
      value: dto.value,
      user,
    });
    
    return this.consentRepository.save(consent);
  }

  async remove(userId: number, consentType: ConsentType): Promise<void> {
    const result = await this.consentRepository.delete({ userId, consentType });
    if (!result.affected) {
      throw new NotFoundException(ERROR_MESSAGES.CONSENT_NOT_FOUND);
    }
  }
}
