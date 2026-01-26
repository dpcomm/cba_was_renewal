import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';

import { Application } from '@modules/application/domain/entities/application.entity';
import { EventResult } from '@modules/application/domain/enum/application.enum';
import { AdminApplicationListDto } from '@modules/application/presentation/dto/admin-application-list.dto';
import { AdminApplicationListResponseDto } from '@modules/application/presentation/dto/admin-application-list.response.dto';

@Injectable()
export class ApplicationService {
  private readonly logger = new Logger(ApplicationService.name);

  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    private readonly dataSource: DataSource,
  ) {}

  async checkApplication(userId: string, retreatId: number): Promise<boolean> {
    const application = await this.applicationRepository.findOne({
      where: {
        userId: userId,
        retreatId: retreatId,
      },
      select: ['id'],
    });

    return !!application;
  }

  async checkApplicatinoPaid(
    userId: string,
    retreatId: number,
  ): Promise<boolean> {
    const application = await this.applicationRepository.findOne({
      where: {
        userId: userId,
        retreatId: retreatId,
      },
      select: ['feePaid'],
    });

    if (!application) {
      throw new NotFoundException(ERROR_MESSAGES.APPLICATION_NOT_FOUND);
    }

    return application.feePaid;
  }

  async getApplicationsByUserId(userId: string): Promise<number[]> {
    const applications = await this.applicationRepository.find({
      where: { userId },
      select: ['retreatId'],
      order: { createdAt: 'ASC' },
    });

    return applications.map((app) => app.retreatId);
  }

  /**
   * 내 등록 정보 상세 조회 (User)
   */
  async getApplicationDetail(
    userId: string,
    retreatId: number,
  ): Promise<Application | null> {
    return this.applicationRepository.findOne({
      where: { userId, retreatId },
    });
  }

  /**
   * 관리자 스캔 조회 (Admin)
   */
  async adminScan(
    userId: string,
    retreatId: number,
  ): Promise<{ name: string; feePaid: boolean; checkedInAt: Date | null }> {
    const application = await this.applicationRepository.findOne({
      where: { userId, retreatId },
      relations: ['user'],
    });

    if (!application) {
      throw new NotFoundException(ERROR_MESSAGES.APPLICATION_NOT_FOUND);
    }

    return {
      name: application.user.name,
      feePaid: application.feePaid,
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
        checkedInBy: adminUserId,
      },
    );

    this.logger.log(
      `Check-in: ${targetUserId} by ${adminUserId} at ${now.toISOString()}`,
    );

    return { checkedInAt: now };
  }

  /**
   * 이벤트 참여 (User)
   */
  async playEvent(
    userId: string,
    retreatId: number,
  ): Promise<{ eventResult: EventResult }> {
    return this.dataSource.transaction(async (manager) => {
      const application = await manager.findOne(Application, {
        where: { userId, retreatId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!application) {
        throw new NotFoundException(ERROR_MESSAGES.APPLICATION_NOT_FOUND);
      }

      if (!application.checkedInAt) {
        throw new ForbiddenException('체크인 후 이벤트 참여가 가능합니다.');
      }

      if (application.eventResult) {
        throw new ConflictException('이미 이벤트에 참여하셨습니다.');
      }

      let result = EventResult.LOSE;
      const winnerCount = await manager.count(Application, {
        where: {
          retreatId,
          eventResult: EventResult.WIN,
        },
      });

      if (winnerCount < 10) {
        const isWin = Math.random() < 0.1;
        if (isWin) {
          result = EventResult.WIN;
        }
      }

      await manager.update(
        Application,
        { userId, retreatId },
        {
          eventResult: result,
          eventParticipatedAt: new Date(),
        },
      );

      this.logger.log(`Event played: ${userId} -> ${result}`);

      return { eventResult: result };
    });
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
      query.andWhere('app.checkedInAt IS NULL');
    } else if (dto.filter === 'FEE_UNPAID') {
      query.andWhere('app.feePaid = false');
    } else if (dto.filter === 'EVENT_WIN') {
      query.andWhere('app.eventResult = :eventResult', { eventResult: 'WIN' });
    }

    const applications = await query.getMany();

    return applications.map((app) => ({
      userId: app.userId,
      name: app.user.name,
      phone: app.user.phone,
      group: app.user.group,
      feePaid: app.feePaid,
      checkedInAt: app.checkedInAt,
      eventResult: app.eventResult ?? null,
    }));
  }
}
