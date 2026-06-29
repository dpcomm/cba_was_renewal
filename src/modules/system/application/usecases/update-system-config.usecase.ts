import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Retreat } from '@modules/retreat/domain/entities/retreat.entity';
import { Term } from '@modules/term/domain/entities/term.entity';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';
import {
  SystemConfig,
  UpdateSystemConfigValues,
} from '../../domain/entities/system-config.entity';
import { GetSystemConfigQuery } from '../queries/get-system-config.query';

export interface UpdateSystemConfigCommand extends Omit<
  UpdateSystemConfigValues,
  'privacyPolicyUpdatedAt'
> {
  privacyPolicyUpdatedAt?: Date | string | null;
}

@Injectable()
export class UpdateSystemConfigUseCase {
  constructor(
    private readonly getSystemConfigQuery: GetSystemConfigQuery,
    @InjectRepository(SystemConfig)
    private readonly systemConfigRepository: Repository<SystemConfig>,
    @InjectRepository(Term)
    private readonly termRepository: Repository<Term>,
    @InjectRepository(Retreat)
    private readonly retreatRepository: Repository<Retreat>,
  ) {}

  async execute(command: UpdateSystemConfigCommand): Promise<SystemConfig> {
    await this.validateSelections(command);

    const config = await this.getSystemConfigQuery.execute();
    const { privacyPolicyUpdatedAt, ...values } = command;
    config.update({
      ...values,
      ...(privacyPolicyUpdatedAt !== undefined
        ? {
            privacyPolicyUpdatedAt:
              privacyPolicyUpdatedAt === null
                ? null
                : new Date(privacyPolicyUpdatedAt),
          }
        : {}),
    });

    await this.systemConfigRepository.save(config);
    return this.getSystemConfigQuery.execute();
  }

  private async validateSelections(
    command: UpdateSystemConfigCommand,
  ): Promise<void> {
    if (
      command.currentTermId !== undefined &&
      command.currentTermId !== null &&
      !(await this.termRepository.existsBy({ id: command.currentTermId }))
    ) {
      throw new BadRequestException(ERROR_MESSAGES.CURRENT_TERM_NOT_FOUND);
    }

    if (
      command.currentRetreatId !== undefined &&
      command.currentRetreatId !== null &&
      !(await this.retreatRepository.existsBy({
        id: command.currentRetreatId,
      }))
    ) {
      throw new BadRequestException(ERROR_MESSAGES.CURRENT_RETREAT_NOT_FOUND);
    }
  }
}
