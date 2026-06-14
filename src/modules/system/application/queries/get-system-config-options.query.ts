import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Retreat } from '@modules/retreat/domain/entities/retreat.entity';
import { Term } from '@modules/term/domain/entities/term.entity';
import { GetSystemConfigQuery } from './get-system-config.query';

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
export class GetSystemConfigOptionsQuery {
  constructor(
    private readonly getSystemConfigQuery: GetSystemConfigQuery,
    @InjectRepository(Term)
    private readonly termRepository: Repository<Term>,
    @InjectRepository(Retreat)
    private readonly retreatRepository: Repository<Retreat>,
  ) {}

  async execute(): Promise<SystemConfigOptions> {
    const [config, terms, retreats] = await Promise.all([
      this.getSystemConfigQuery.execute(),
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
