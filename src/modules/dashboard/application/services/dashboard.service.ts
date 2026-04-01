import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '@modules/application/domain/entities/application.entity';
import { Retreat } from '@modules/retreat/domain/entities/retreat.entity';
import { User } from '@modules/user/domain/entities/user.entity';
import {
  DashboardGroupStatResponseDto,
  DashboardSummaryResponseDto,
} from '@modules/dashboard/presentation/dto/dashboard.response.dto';
import { ApplicationMeal } from '@modules/application/domain/entities/application_meal.entity';
import { MealType } from '@modules/retreat/domain/enum/retreat-meal.enum';
import {
  ApplicationStatus,
  PaymentStatus,
} from '@modules/application/domain/enum/application.enum';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
    @InjectRepository(Retreat)
    private readonly retreatRepository: Repository<Retreat>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getSummary(retreatId?: number): Promise<DashboardSummaryResponseDto> {
    const totalCount = await this.userRepository.count({
      where: { isDeleted: false },
    });
    const targetRetreatId = retreatId ?? (await this.getLatestRetreatId());

    if (!targetRetreatId) {
      return {
        retreatId: null,
        totalCount,
        appliedCount: 0,
        paidCount: 0,
        checkedInCount: 0,
        mealStats: this.createEmptyMealStats(),
      };
    }

    const [appliedCount, paidCount, checkedInCount] = await Promise.all([
      this.applicationRepository.count({
        where: { retreatId: targetRetreatId },
      }),
      this.applicationRepository.count({
        where: {
          retreatId: targetRetreatId,
          paymentStatus: PaymentStatus.PAID,
        },
      }),
      this.applicationRepository.count({
        where: {
          retreatId: targetRetreatId,
          status: ApplicationStatus.CHECKED_IN,
        },
      }),
    ]);

    const mealStatsRaw = await this.applicationRepository.manager
      .createQueryBuilder(ApplicationMeal, 'am')
      .innerJoin('am.retreatMeal', 'rm')
      .innerJoin('am.application', 'app')
      .select('rm.dayNumber', 'dayNumber')
      .addSelect('rm.mealType', 'mealType')
      .addSelect('COUNT(am.id)', 'count')
      .where('app.retreatId = :retreatId', { retreatId: targetRetreatId })
      .groupBy('rm.dayNumber')
      .addGroupBy('rm.mealType')
      .getRawMany<{ dayNumber: number; mealType: MealType; count: string }>();

    const mealStats = this.createEmptyMealStats();
    for (const stat of mealStatsRaw) {
      const dayIdx = stat.dayNumber - 1;
      let mealIdx = 0;
      if (stat.mealType === MealType.LUNCH) mealIdx = 1;
      else if (stat.mealType === MealType.DINNER) mealIdx = 2;

      if (dayIdx >= 0 && dayIdx < 3 && mealIdx >= 0 && mealIdx < 3) {
        mealStats[dayIdx][mealIdx] = Number(stat.count);
      }
    }

    return {
      retreatId: targetRetreatId,
      totalCount,
      appliedCount,
      paidCount,
      checkedInCount,
      mealStats,
    };
  }

  async getGroupStats(
    retreatId?: number,
  ): Promise<DashboardGroupStatResponseDto[]> {
    const targetRetreatId = retreatId ?? (await this.getLatestRetreatId());
    const groupTotals = await this.userRepository
      .createQueryBuilder('user')
      .select("COALESCE(user.group, '미지정')", 'group')
      .addSelect('COUNT(user.id)', 'totalCount')
      .where('user.isDeleted = :isDeleted', { isDeleted: false })
      .groupBy("COALESCE(user.group, '미지정')")
      .getRawMany<{ group: string; totalCount: string }>();

    const appliedStats = targetRetreatId
      ? await this.applicationRepository
          .createQueryBuilder('application')
          .innerJoin('application.user', 'user')
          .select("COALESCE(user.group, '미지정')", 'group')
          .addSelect('COUNT(application.id)', 'appliedCount')
          .addSelect(
            'SUM(CASE WHEN application.payment_status = :paid THEN 1 ELSE 0 END)',
            'paidCount',
          )
          .addSelect(
            'SUM(CASE WHEN application.status = :checkedIn THEN 1 ELSE 0 END)',
            'checkedInCount',
          )
          .where('application.retreatId = :retreatId', {
            retreatId: targetRetreatId,
          })
          .setParameters({
            paid: PaymentStatus.PAID,
            checkedIn: ApplicationStatus.CHECKED_IN,
          })
          .andWhere('user.isDeleted = :isDeleted', { isDeleted: false })
          .groupBy("COALESCE(user.group, '미지정')")
          .getRawMany<{
            group: string;
            appliedCount: string;
            paidCount: string;
            checkedInCount: string;
          }>()
      : [];

    const appliedMap = new Map(
      appliedStats.map((item) => [
        item.group,
        {
          appliedCount: Number(item.appliedCount) || 0,
          paidCount: Number(item.paidCount) || 0,
          checkedInCount: Number(item.checkedInCount) || 0,
        },
      ]),
    );

    return groupTotals
      .map((total) => {
        const applied = appliedMap.get(total.group) ?? {
          appliedCount: 0,
          paidCount: 0,
          checkedInCount: 0,
        };
        return {
          group: total.group,
          totalCount: Number(total.totalCount) || 0,
          appliedCount: applied.appliedCount,
          paidCount: applied.paidCount,
          checkedInCount: applied.checkedInCount,
        };
      })
      .sort((a, b) => a.group.localeCompare(b.group));
  }

  private async getLatestRetreatId(): Promise<number | null> {
    const [latest] = await this.retreatRepository.find({
      select: ['id'],
      order: { id: 'DESC' },
      take: 1,
    });

    return latest?.id ?? null;
  }

  private createEmptyMealStats(): number[][] {
    return [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];
  }
}
