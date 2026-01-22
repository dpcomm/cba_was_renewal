import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '@modules/application/domain/entities/application.entity';
import { Retreat } from '@modules/retreat/domain/entities/retreat.entity';
import { User } from '@modules/user/domain/entities/user.entity';
import { DashboardSummaryResponseDto } from '@modules/dashboard/presentation/dto/dashboard.response.dto';

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
    const totalCount = await this.userRepository.count({ where: { isDeleted: false } });
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

    const [appliedCount, feePaidCount, attendedCount, applications] = await Promise.all([
      this.applicationRepository.count({ where: { retreatId: targetRetreatId } }),
      this.applicationRepository.count({ where: { retreatId: targetRetreatId, feePaid: true } }),
      this.applicationRepository.count({ where: { retreatId: targetRetreatId, attended: true } }),
      this.applicationRepository
        .createQueryBuilder('application')
        .select(['application.id', 'application.surveyData'])
        .where('application.retreatId = :retreatId', { retreatId: targetRetreatId })
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

  private async getLatestRetreatId(): Promise<number | null> {
    const latest = await this.retreatRepository.findOne({
      select: ['id'],
      order: { id: 'DESC' },
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
        const dayMeals = Array.isArray(mealData[dayIndex]) ? mealData[dayIndex] : [];
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
