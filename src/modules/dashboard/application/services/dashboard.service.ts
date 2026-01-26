import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '@modules/application/domain/entities/application.entity';
import { Retreat } from '@modules/retreat/domain/entities/retreat.entity';
import { User } from '@modules/user/domain/entities/user.entity';
import { DashboardGroupStatResponseDto, DashboardSummaryResponseDto } from '@modules/dashboard/presentation/dto/dashboard.response.dto';

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
        feePaidCount: 0,
        attendedCount: 0,
        mealStats: this.createEmptyMealStats(),
      };
    }

    const [appliedCount, feePaidCount, attendedCount, applications] =
      await Promise.all([
        this.applicationRepository.count({
          where: { retreatId: targetRetreatId },
        }),
        this.applicationRepository.count({
          where: { retreatId: targetRetreatId, feePaid: true },
        }),
        this.applicationRepository.count({
          where: { retreatId: targetRetreatId, attended: true },
        }),
        this.applicationRepository
          .createQueryBuilder('application')
          .select(['application.id', 'application.surveyData'])
          .where('application.retreatId = :retreatId', {
            retreatId: targetRetreatId,
          })
          .getMany(),
      ]);

    return {
      retreatId: targetRetreatId,
      totalCount,
      appliedCount,
      feePaidCount,
      attendedCount,
      mealStats: this.calculateMealStats(applications),
    };
  }

  async getGroupStats(retreatId?: number): Promise<DashboardGroupStatResponseDto[]> {
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
          .addSelect('SUM(CASE WHEN application.feePaid = true THEN 1 ELSE 0 END)', 'feePaidCount')
          .addSelect('SUM(CASE WHEN application.attended = true THEN 1 ELSE 0 END)', 'attendedCount')
          .where('application.retreatId = :retreatId', { retreatId: targetRetreatId })
          .andWhere('user.isDeleted = :isDeleted', { isDeleted: false })
          .groupBy("COALESCE(user.group, '미지정')")
          .getRawMany<{
            group: string;
            appliedCount: string;
            feePaidCount: string;
            attendedCount: string;
          }>()
      : [];

    const appliedMap = new Map(
      appliedStats.map((item) => [
        item.group,
        {
          appliedCount: Number(item.appliedCount) || 0,
          feePaidCount: Number(item.feePaidCount) || 0,
          attendedCount: Number(item.attendedCount) || 0,
        },
      ]),
    );

    return groupTotals
      .map((total) => {
        const applied = appliedMap.get(total.group) ?? {
          appliedCount: 0,
          feePaidCount: 0,
          attendedCount: 0,
        };
        return {
          group: total.group,
          totalCount: Number(total.totalCount) || 0,
          appliedCount: applied.appliedCount,
          feePaidCount: applied.feePaidCount,
          attendedCount: applied.attendedCount,
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

  private calculateMealStats(applications: Application[]): number[][] {
    const stats = this.createEmptyMealStats();

    for (const application of applications) {
      const mealData = application?.surveyData?.meal;
      if (!Array.isArray(mealData)) continue;

      for (let dayIndex = 0; dayIndex < 3; dayIndex += 1) {
        const dayMeals = Array.isArray(mealData[dayIndex])
          ? mealData[dayIndex]
          : [];
        for (let mealIndex = 0; mealIndex < 3; mealIndex += 1) {
          const value = dayMeals[mealIndex];
          if (typeof value === 'number') {
            stats[dayIndex][mealIndex] += value;
          } else if (value) {
            stats[dayIndex][mealIndex] += 1;
          }
        }
      }
    }

    return stats;
  }
}
