import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfig } from '@modules/system/domain/entities/system-config.entity';
import { Term } from '@modules/term/domain/entities/term.entity';
import { Retreat } from '@modules/retreat/domain/entities/retreat.entity';

export interface UpdateSystemConfigData {
  appName?: string;
  versionName?: string;
  versionCode?: number;
  minimumVersionCode?: number;
  privacyPolicyUrl?: string | null;
  privacyPolicyVersion?: number;
  privacyPolicyUpdatedAt?: Date | string | null;
  maintenanceMode?: boolean;
  maintenanceMessage?: string | null;
  currentTermId?: number | null;
  currentRetreatId?: number | null;
}

export interface SystemConfigOption {
  id: number;
  label: string;
}

export interface SystemConfigOptions {
  currentTermId: number | null;
  currentRetreatId: number | null;
  terms: SystemConfigOption[];
  retreats: SystemConfigOption[];
}

@Injectable()
export class SystemService {
  constructor(
    @InjectRepository(SystemConfig)
    private readonly systemConfigRepository: Repository<SystemConfig>,
    @InjectRepository(Term)
    private readonly termRepository: Repository<Term>,
    @InjectRepository(Retreat)
    private readonly retreatRepository: Repository<Retreat>,
  ) {}

  async getConfig(): Promise<SystemConfig> {
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

  async updateConfig(data: UpdateSystemConfigData): Promise<SystemConfig> {
    const config = await this.getConfig();

    if (data.currentTermId !== undefined && data.currentTermId !== null) {
      const exists = await this.termRepository.existsBy({
        id: data.currentTermId,
      });
      if (!exists) {
        throw new BadRequestException('currentTermId does not exist.');
      }
    }

    if (data.currentRetreatId !== undefined && data.currentRetreatId !== null) {
      const exists = await this.retreatRepository.existsBy({
        id: data.currentRetreatId,
      });
      if (!exists) {
        throw new BadRequestException('currentRetreatId does not exist.');
      }
    }

    Object.assign(config, {
      ...data,
      id: 1,
      privacyPolicyUpdatedAt:
        data.privacyPolicyUpdatedAt === undefined ||
        data.privacyPolicyUpdatedAt === null
          ? data.privacyPolicyUpdatedAt
          : new Date(data.privacyPolicyUpdatedAt),
    });

    await this.systemConfigRepository.save(config);
    return this.getConfig();
  }

  async getOptions(): Promise<SystemConfigOptions> {
    const [config, terms, retreats] = await Promise.all([
      this.getConfig(),
      this.termRepository.find({
        select: {
          id: true,
          name: true,
        },
        order: {
          startDate: 'DESC',
          id: 'DESC',
        },
      }),
      this.retreatRepository.find({
        select: {
          id: true,
          title: true,
        },
        order: {
          retreatStartAt: 'DESC',
          id: 'DESC',
        },
      }),
    ]);

    return {
      currentTermId: config.currentTermId,
      currentRetreatId: config.currentRetreatId,
      terms: terms.map((term) => ({
        id: term.id,
        label: term.name,
      })),
      retreats: retreats.map((retreat) => ({
        id: retreat.id,
        label: retreat.title,
      })),
    };
  }
}
