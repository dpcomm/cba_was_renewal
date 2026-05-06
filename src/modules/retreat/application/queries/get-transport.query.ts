import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RetreatTransport } from '../../domain/entities/retreat_transport.entity';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';

@Injectable()
export class GetTransportQuery {
  constructor(
    @InjectRepository(RetreatTransport)
    private readonly transportRepository: Repository<RetreatTransport>,
  ) {}

  async execute(id: number): Promise<RetreatTransport & { applicantCount: number }> {
    const query = this.transportRepository
      .createQueryBuilder('transport')
      .leftJoin('transport.applicationTransports', 'at')
      .select('transport')
      .addSelect('COUNT(at.id)', 'applicantCount')
      .where('transport.id = :id', { id })
      .groupBy('transport.id');

    const { entities, raw } = await query.getRawAndEntities();
    const entity = entities[0];

    if (!entity) {
      throw new NotFoundException(ERROR_MESSAGES.TRANSPORT_NOT_FOUND);
    }

    const rawData = raw.find((r) => r.transport_id === entity.id);

    return Object.assign(entity, {
      applicantCount: Number(rawData?.applicantCount || 0),
    }) as RetreatTransport & { applicantCount: number };
  }
}
