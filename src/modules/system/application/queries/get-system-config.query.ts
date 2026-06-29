import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfig } from '../../domain/entities/system-config.entity';

@Injectable()
export class GetSystemConfigQuery {
  constructor(
    @InjectRepository(SystemConfig)
    private readonly systemConfigRepository: Repository<SystemConfig>,
  ) {}

  async execute(): Promise<SystemConfig> {
    const config = await this.systemConfigRepository.findOne({
      where: { id: 1 },
      relations: {
        currentTerm: true,
        currentRetreat: true,
      },
    });

    if (config) {
      return config;
    }

    const defaultConfig = this.systemConfigRepository.create({
      id: 1,
      appName: 'CBA Connect',
      versionName: '1.0.0',
      versionCode: 1,
      minimumVersionCode: 1,
      privacyPolicyUrl: null,
      privacyPolicyVersion: 1,
      privacyPolicyUpdatedAt: null,
      maintenanceMode: false,
      maintenanceMessage: null,
      currentTermId: null,
      currentRetreatId: null,
    });

    return this.systemConfigRepository.save(defaultConfig);
  }
}
