import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';

import { Application } from '@modules/application/domain/entities/application.entity';
import {
  ApplicationStatus,
  PaymentStatus,
} from '@modules/application/domain/enum/application.enum';
import { AdminApplicationListDto } from '@modules/application/presentation/dto/request/admin-application-list.request.dto';
import { AdminApplicationListResponseDto } from '@modules/application/presentation/dto/response/admin-application-list.response.dto';

@Injectable()
export class ApplicationService {
  private readonly logger = new Logger(ApplicationService.name);

  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
  ) {}

  /**
   * 관리자 스캔 조회 (Admin)
   */
  async adminScan(
    userId: string,
    retreatId: number,
  ): Promise<{
    userId: string;
    name: string;
    phone: string;
    group: string;
    paymentStatus: PaymentStatus;
    status: ApplicationStatus;
    checkedInAt: Date | null;
  }> {
    const application = await this.applicationRepository.findOne({
      where: { userId, retreatId },
      relations: ['user'],
      select: {
        id: true,
        userId: true,
        paymentStatus: true,
        status: true,
        checkedInAt: true,
        user: {
          name: true,
          phone: true,
          group: true,
        },
      },
    });

    if (!application) {
      throw new NotFoundException(ERROR_MESSAGES.APPLICATION_NOT_FOUND);
    }

    this.logger.log(
      `QR 스캔 조회: ${application.user.name}(${application.userId}) - 결과: ${application.paymentStatus === PaymentStatus.PAID ? '입금완료' : '미입금'}, ${application.status === ApplicationStatus.CHECKED_IN ? '체크인완료' : '미체크인'}`,
    );

    return {
      userId: application.userId,
      name: application.user.name,
      phone: application.user.phone,
      group: application.user.group,
      paymentStatus: application.paymentStatus,
      status: application.status,
      checkedInAt: application.checkedInAt,
    };
  }

  /**
   * 체크인 처리 (Admin)
   */
  async checkIn(
    targetUserId: string,
    retreatId: number,
    adminUserId: string,
  ): Promise<{ checkedInAt: Date }> {
    const application = await this.applicationRepository.findOne({
      where: { userId: targetUserId, retreatId },
      relations: ['user'],
      select: {
        id: true,
        checkedInAt: true,
        user: {
          name: true,
        },
      },
    });

    if (!application) {
      throw new NotFoundException(ERROR_MESSAGES.APPLICATION_NOT_FOUND);
    }

    if (application.checkedInAt) {
      throw new ConflictException('이미 체크인된 사용자입니다.');
    }

    const now = new Date();
    await this.applicationRepository.update(
      { userId: targetUserId, retreatId },
      {
        checkedInAt: now,
        status: ApplicationStatus.CHECKED_IN,
      },
    );

    this.logger.log(
      `체크인 완료: ${application.user.name}(${targetUserId}) - 승인 계정 ID: ${adminUserId}`,
    );

    return { checkedInAt: now };
  }

  /**
   * 관리자: 신청자 목록 조회 (검색/필터)
   */
  async getApplicationList(
    dto: AdminApplicationListDto,
  ): Promise<AdminApplicationListResponseDto[]> {
    const query = this.applicationRepository
      .createQueryBuilder('app')
      .leftJoinAndSelect('app.user', 'user')
      .where('app.retreatId = :retreatId', { retreatId: dto.retreatId })
      .orderBy('user.name', 'ASC');

    // 검색 (이름 or 번호)
    if (dto.search) {
      query.andWhere('(user.name LIKE :search OR user.phone LIKE :search)', {
        search: `%${dto.search}%`,
      });
    }

    // 필터
    if (dto.filter === 'NOT_CHECKED_IN') {
      query.andWhere('app.status != :checkedIn', {
        checkedIn: ApplicationStatus.CHECKED_IN,
      });
    } else if (dto.filter === 'FEE_UNPAID') {
      query.andWhere('app.paymentStatus != :paid', {
        paid: PaymentStatus.PAID,
      });
    } else if (dto.filter === 'EVENT_WIN') {
      query.andWhere('app.eventResult = :eventResult', { eventResult: 'WIN' });
    }

    const applications = await query
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
      .getMany();

    return applications.map((app) => ({
      userId: app.userId,
      name: app.user.name,
      phone: app.user.phone,
      group: app.user.group,
      paymentStatus: app.paymentStatus,
      status: app.status,
      checkedInAt: app.checkedInAt,
      eventResult: app.eventResult ?? null,
    }));
  }
}
