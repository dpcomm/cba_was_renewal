import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RetreatTransport } from '../../domain/entities/retreat_transport.entity';
import { TransportDirection, TransportType } from '../../domain/enum/retreat-transport.enum';

@Injectable()
export class GetTransportListQuery {
  constructor(
    @InjectRepository(RetreatTransport)
    private readonly transportRepository: Repository<RetreatTransport>,
  ) {}

  async execute(data: {
    retreatId: number;
    direction?: TransportDirection;
    transportType?: TransportType;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: (RetreatTransport & { applicantCount: number })[]; total: number }> {
    const { retreatId, direction, transportType, search, page = 1, limit = 10 } = data;

    const query = this.transportRepository
      .createQueryBuilder('transport')
      .leftJoin('transport.applicationTransports', 'at')
      .select('transport')
      .addSelect('COUNT(at.id)', 'applicantCount')
      .where('transport.retreatId = :retreatId', { retreatId })
      .groupBy('transport.id');

    const countQuery = this.transportRepository
      .createQueryBuilder('transport')
      .where('transport.retreatId = :retreatId', { retreatId });

    if (direction) {
      query.andWhere('transport.direction = :direction', { direction });
      countQuery.andWhere('transport.direction = :direction', { direction });
    }

    if (transportType) {
      query.andWhere('transport.transportType = :transportType', { transportType });
      countQuery.andWhere('transport.transportType = :transportType', { transportType });
    }

    if (search) {
      query.andWhere('transport.name LIKE :search', { search: `%${search}%` });
      countQuery.andWhere('transport.name LIKE :search', { search: `%${search}%` });
    }

    const total = await countQuery.getCount();
    const { entities, raw } = await query
      .orderBy('transport.id', 'DESC')
      .offset((page - 1) * limit)
      .limit(limit)
      .getRawAndEntities();

    const items = entities.map((entity) => {
      const rawData = raw.find((r) => r.transport_id === entity.id);
      return Object.assign(entity, {
        applicantCount: Number(rawData?.applicantCount || 0),
      }) as RetreatTransport & { applicantCount: number };
    });

    return { items, total };
  }
}