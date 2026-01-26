import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfig } from '@modules/system/domain/entities/system-config.entity';

@Injectable()
export class SystemService {
  constructor(
    @InjectRepository(SystemConfig)
    private readonly systemConfigRepository: Repository<SystemConfig>,
  ) {}

  async getConfig(): Promise<SystemConfig | null> {
    return this.systemConfigRepository.findOne({ where: { id: 1 } });
  }

  async updateConfig(
    data: Partial<
      Pick<
        SystemConfig,
        | 'appName'
        | 'versionName'
        | 'versionCode'
        | 'privacyPolicyUrl'
        | 'privacyPolicyVersion'
        | 'currentTermId'
        | 'currentRetreatId'
      >
    >,
  ): Promise<SystemConfig> {
    const config = await this.getConfig();
    if (!config) {
      throw new NotFoundException(
        'SystemConfig not found. Please insert initial data first.',
      );
    }
    Object.assign(config, data);
    return this.systemConfigRepository.save(config);
  }
}
