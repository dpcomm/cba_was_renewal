import { Application } from '@modules/application/domain/entities/application.entity';
import {
  ApplicationStatus,
  EventResult,
  PaymentStatus,
} from '@modules/application/domain/enum/application.enum';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserGroup } from '@modules/user/domain/enums/user-group.enum';
import { Repository } from 'typeorm';

export interface GetAdminApplicationListParams {
  retreatId: number;
  search?: string;
  paymentStatus?: PaymentStatus;
  applicationStatus?: ApplicationStatus;
  group?: UserGroup;
  page?: number;
  limit?: number;
}

export interface AdminApplicationListItem {
  userId: string;
  name: string;
  phone: string;
  group: UserGroup;
  paymentStatus: PaymentStatus;
  status: ApplicationStatus;
  checkedInAt: Date | null;
  eventResult: EventResult | null;
}

export interface AdminApplicationListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface AdminApplicationListResult {
  items: AdminApplicationListItem[];
  meta: AdminApplicationListMeta;
}

@Injectable()
export class GetAdminApplicationListQuery {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
  ) {}

  async execute(
    params: GetAdminApplicationListParams,
  ): Promise<AdminApplicationListResult> {
    const page = Math.max(1, Math.trunc(params.page ?? 1));
    const limit = Math.min(Math.max(1, Math.trunc(params.limit ?? 20)), 100);

    const query = this.applicationRepository
      .createQueryBuilder('app')
      .leftJoinAndSelect('app.user', 'user')
      .where('app.retreatId = :retreatId', { retreatId: params.retreatId })
      .orderBy('user.name', 'ASC');

    const search = params.search?.trim();
    if (search) {
      query.andWhere(
        '(user.name LIKE :search OR user.userId LIKE :search OR user.group LIKE :search)',
        {
          search: `%${search}%`,
        },
      );
    }

    if (params.paymentStatus) {
      query.andWhere('app.paymentStatus = :paymentStatus', {
        paymentStatus: params.paymentStatus,
      });
    }

    if (params.applicationStatus) {
      query.andWhere('app.status = :applicationStatus', {
        applicationStatus: params.applicationStatus,
      });
    }

    if (params.group) {
      query.andWhere('user.group = :group', {
        group: params.group,
      });
    }

    const [applications, total] = await query
      .select([
        'app.userId',
        'user.name',
        'user.phone',
        'user.group',
        'app.paymentStatus',
        'app.status',
        'app.checkedInAt',
        'app.eventResult',
      ])
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      items: applications.map((application) => ({
        userId: application.userId,
        name: application.user.name,
        phone: application.user.phone,
        group: application.user.group,
        paymentStatus: application.paymentStatus,
        status: application.status,
        checkedInAt: application.checkedInAt,
        eventResult: application.eventResult ?? null,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }
}
