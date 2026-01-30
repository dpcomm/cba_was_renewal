import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';
import { Lecture } from '@modules/lecture/domain/entities/lecture.entity';
import { LectureEnrollment } from '@modules/lecture/domain/entities/lectureEnrollment.entity';
import { Retreat } from '@modules/retreat/domain/entities/retreat.entity';
import { User } from '@modules/user/domain/entities/user.entity';
import {
  createLectureRequestDto,
  updateLectureRequestDto,
  enrollLectureRequestDto,
  dropLectureRequestDto,
} from '../dto/lecture.request.dto';
@Injectable()
export class LectureService {
  private readonly logger = new Logger(LectureService.name);

  constructor(
    @InjectRepository(Lecture)
    private lectureRepository: Repository<Lecture>,
    @InjectRepository(LectureEnrollment)
    private lecutreEnrollmentRepository: Repository<LectureEnrollment>,
    @InjectRepository(Retreat)
    private readonly retreatRepository: Repository<Retreat>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  // filter조건에 따른 lecture 목록 조회

  // 내 강의 목록 조회
  async getMyLectures(userId: number): Promise<Lecture[]> {
    const enrollments = await this.lecutreEnrollmentRepository.find({
      where: { userId },
      relations: ['lecture', 'lecture.term'],
      order: {
        enrolledAt: 'DESC',
      },
    });

    return enrollments.map((enrollment) => enrollment.lecture);
  }

  // id에 따른 lecture 정보 조회
  async getLectureById(lectureId: number): Promise<Lecture> {
    const lecture = await this.lectureRepository.findOne({
      where: { id: lectureId },
      relations: ['term'],
    });

    if (!lecture) {
      throw new NotFoundException(ERROR_MESSAGES.LECTURE_NOT_FOUND);
    }

    return lecture;
  }

  // id에 따른 참여자 정보를 포함한 lecture 정보 조회
  async getLectureDetailById(
    lectureId: number,
  ): Promise<{
    id: number;
    title: string;
    instructorName: string;
    instructorBio: string;
    location: string;
    startTime: string;
    currentCount: number;
    maxCapacity: number;
    termName: string;
    codeNumber: string;
    introduction: string;
    enrollees: Array<{
      id: number;
      name: string;
      group: string;
      phone: string;
    }>;
  }> {
    const lecture = await this.lectureRepository.findOne({
      where: { id: lectureId },
      relations: ['term', 'enrollments', 'enrollments.user'],
    });

    if (!lecture) {
      throw new NotFoundException(ERROR_MESSAGES.LECTURE_NOT_FOUND);
    }

    return {
      id: lecture.id,
      title: lecture.title,
      instructorName: lecture.instructor,
      instructorBio: lecture.instructorBio,
      location: lecture.location,
      startTime: lecture.startTime.toISOString(),
      currentCount: lecture.currentCount,
      maxCapacity: lecture.maxCapacity,
      termName: lecture.term.name,
      codeNumber: lecture.codeNumber,
      introduction: lecture.introduction,
      enrollees: lecture.enrollments.map((enrollment) => ({
        id: enrollment.user.id,
        name: enrollment.user.name,
        group: enrollment.user.group,
        phone: enrollment.user.phone,
      })),
    };
  }

  // lecture 생성
  async createLecture(dto: createLectureRequestDto): Promise<Lecture> {
    // 같은 term 내에서 마지막 codeNumber 조회
    const maxCode = await this.lectureRepository
      .createQueryBuilder('lecture')
      .select('MAX(CAST(lecture.codeNumber AS UNSIGNED))', 'maxCode')
      .where('lecture.term_id = :termId', { termId: dto.termId })
      .getRawOne();

    const nextCodeNumber = (parseInt(maxCode?.maxCode ?? '0') + 1)
      .toString()
      .padStart(3, '0');

    const lecture = this.lectureRepository.create({
      title: dto.title,
      introduction: dto.introduction,
      instructor: dto.instructor,
      instructorBio: dto.instructorBio ?? 'CBA 대학청년부 선교사',
      location: dto.location,
      maxCapacity: dto.maxCapacity,
      startTime: new Date(dto.startTime),
      codeNumber: nextCodeNumber,
      term: { id: dto.termId },
    });

    const savedLecture = await this.lectureRepository.save(lecture);

    const lectureWithRelations = await this.lectureRepository.findOne({
      where: { id: savedLecture.id },
      relations: ['term'],
    });

    if (!lectureWithRelations) {
      throw new NotFoundException('Lecture not found after save');
    }

    this.logger.log(`강의 생성 완료 - ID: ${savedLecture.id}`);

    return lectureWithRelations;
  }

  // lecture 수정
  async updateLecture(dto: updateLectureRequestDto): Promise<Lecture> {
    const lecture = await this.lectureRepository.findOne({
      where: { id: dto.id },
    });

    if (!lecture) {
      throw new NotFoundException(ERROR_MESSAGES.LECTURE_NOT_FOUND);
    }

    // maxCapacity 검증 (수정 시에만)
    if (
      dto.maxCapacity !== undefined &&
      dto.maxCapacity < lecture.currentCount
    ) {
      throw new BadRequestException(
        `maxCapacity(${dto.maxCapacity})는 현재 인원(${lecture.currentCount})보다 작을 수 없습니다`,
      );
    }

    // 명시적 업데이트 필드 정의
    const updatableFields: (keyof updateLectureRequestDto)[] = [
      'title',
      'introduction',
      'instructor',
      'instructorBio',
      'location',
      'maxCapacity',
      'startTime',
    ];

    // null/undefined 제외하고만 업데이트
    for (const key of updatableFields) {
      const value = dto[key];
      if (value == null) continue;

      if (key === 'startTime') {
        lecture.startTime = new Date(value as any);
      } else {
        (lecture as any)[key] = value;
      }
    }

    const savedLecture = await this.lectureRepository.save(lecture);

    const lectureWithRelations = await this.lectureRepository.findOne({
      where: { id: savedLecture.id },
      relations: ['term'],
    });

    if (!lectureWithRelations) {
      throw new NotFoundException('Lecture not found after save');
    }

    this.logger.log(`강의 수정 완료 - ID: ${savedLecture.id}`);

    return lectureWithRelations;
  }

  // lecture 삭제
  async deleteLecture(lectureId: number): Promise<void> {
    await this.lectureRepository.delete({ id: lectureId });
    this.logger.log(`강의 삭제 완료 - ID: ${lectureId}`);
  }

  // lecture 신청
  async enrollLecture(dto: enrollLectureRequestDto): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const lecture = await manager.findOne(Lecture, {
        where: { id: dto.lectureId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!lecture) {
        throw new NotFoundException(ERROR_MESSAGES.LECTURE_NOT_FOUND);
      }

      // 이미 신청했는지 체크
      const existing = await manager.findOne(LectureEnrollment, {
        where: {
          lecture: { id: dto.lectureId },
          user: { id: dto.userId },
        },
      });

      if (existing) {
        throw new BadRequestException(ERROR_MESSAGES.ALREADY_ENROLLED);
      }

      // 정원 체크
      if (lecture.currentCount >= lecture.maxCapacity) {
        throw new BadRequestException(ERROR_MESSAGES.LECTURE_FULL);
      }

      // enrollment 생성
      const enrollment = manager.create(LectureEnrollment, {
        lecture: { id: dto.lectureId },
        user: { id: dto.userId },
      });
      await manager.save(LectureEnrollment, enrollment);

      // currentCount 증가 (원자적)
      await manager.increment(
        Lecture,
        { id: dto.lectureId },
        'currentCount',
        1,
      );
      const user = await manager.findOne(User, {
        where: { id: dto.userId },
        select: ['name'],
      });
      this.logger.log(
        `수강 신청 완료 - 사용자: ${user?.name ?? '알수없음'} (${dto.userId}), 강의 ID: ${dto.lectureId}`,
      );
    });
  }

  // lecture 신청 취소
  async dropLecture(dto: dropLectureRequestDto): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const enrollment = await manager.findOne(LectureEnrollment, {
        where: {
          lecture: { id: dto.lectureId },
          user: { id: dto.userId },
        },
        relations: ['lecture', 'user'],
        lock: { mode: 'pessimistic_write' },
      });

      if (!enrollment) {
        throw new NotFoundException(ERROR_MESSAGES.ENROLLMENT_NOT_FOUND);
      }

      // currentCount 원자적 감소
      await manager.decrement(
        Lecture,
        { id: dto.lectureId },
        'currentCount',
        1,
      );
      // enrollment 삭제
      await manager.remove(LectureEnrollment, enrollment);

      this.logger.log(
        `수강 신청 취소 - 사용자: ${enrollment.user.name} (${dto.userId}), 강의 ID: ${dto.lectureId}`,
      );

      return enrollment;
    });
  }

  private async getLatestRetreatId(): Promise<number> {
    const latest = await this.retreatRepository
      .createQueryBuilder('retreat')
      .select(['retreat.id'])
      .orderBy('retreat.id', 'DESC')
      .limit(1)
      .getOne();

    if (!latest) {
      throw new NotFoundException(ERROR_MESSAGES.RETREAT_NOT_FOUND);
    }

    return latest.id;
  }

  private async getEligibleUsersForTerm(
    termId: number,
    name?: string,
    limit?: number,
    retreatId?: number,
  ): Promise<User[]> {
    const resolvedRetreatId =
      typeof retreatId === 'number' && retreatId > 0
        ? retreatId
        : await this.getLatestRetreatId();

    const enrolledSubQuery = this.lecutreEnrollmentRepository
      .createQueryBuilder('enrollment')
      .select('enrollment.userId')
      .innerJoin('enrollment.lecture', 'lecture')
      .where('lecture.term_id = :termId', { termId });

    const query = this.userRepository
      .createQueryBuilder('user')
      .innerJoin(
        'user.applications',
        'application',
        'application.retreatId = :retreatId AND application.attended = :attended',
        { retreatId: resolvedRetreatId, attended: true },
      )
      .where('user.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere(`user.id NOT IN (${enrolledSubQuery.getQuery()})`)
      .setParameter('termId', termId)
      .orderBy('user.name', 'ASC')
      .addOrderBy('user.id', 'ASC');

    if (name) {
      query.andWhere('user.name LIKE :name', { name: `%${name}%` });
    }

    if (limit) {
      query.take(limit);
    }

    return query.getMany();
  }

  async searchEligibleUsers(
    termId: number,
    name?: string,
    retreatId?: number,
    limit?: number,
  ): Promise<User[]> {
    return this.getEligibleUsersForTerm(termId, name, limit, retreatId);
  }

  async enrollEligibleUsers(
    lectureId: number,
    userIds: number[],
  ): Promise<number> {
    if (!userIds || userIds.length === 0) return 0;

    const uniqueUserIds = Array.from(new Set(userIds));

    return this.dataSource.transaction(async (manager) => {
      const lecture = await manager.findOne(Lecture, {
        where: { id: lectureId },
        relations: ['term'],
        lock: { mode: 'pessimistic_write' },
      });

      if (!lecture) {
        throw new NotFoundException(ERROR_MESSAGES.LECTURE_NOT_FOUND);
      }

      const remaining = lecture.maxCapacity - lecture.currentCount;
      if (remaining <= 0) {
        throw new BadRequestException(ERROR_MESSAGES.LECTURE_FULL);
      }

      if (uniqueUserIds.length > remaining) {
        throw new BadRequestException(ERROR_MESSAGES.LECTURE_CAPACITY_EXCEEDED);
      }

      const eligibleUsers = await this.getEligibleUsersForTerm(lecture.term.id);
      const eligibleSet = new Set(eligibleUsers.map((user) => user.id));
      const hasIneligible = uniqueUserIds.some((id) => !eligibleSet.has(id));

      if (hasIneligible) {
        throw new BadRequestException(
          ERROR_MESSAGES.LECTURE_ELIGIBLE_USER_REQUIRED,
        );
      }

      const existing = await manager.find(LectureEnrollment, {
        where: {
          lectureId,
          userId: In(uniqueUserIds),
        },
      });

      if (existing.length > 0) {
        throw new BadRequestException(ERROR_MESSAGES.ALREADY_ENROLLED);
      }

      const enrollments = uniqueUserIds.map((userId) =>
        manager.create(LectureEnrollment, {
          lecture: { id: lectureId },
          user: { id: userId },
        }),
      );
      await manager.save(LectureEnrollment, enrollments);

      await manager.increment(
        Lecture,
        { id: lectureId },
        'currentCount',
        uniqueUserIds.length,
      );

      return uniqueUserIds.length;
    });
  }

  async autoAssignLectures(termId: number): Promise<{
    totalAssigned: number;
    remainingEligible: number;
    lectures: { lectureId: number; assignedCount: number }[];
  }> {
    try {
      const eligibleUsers = await this.getEligibleUsersForTerm(termId);
      const pool = eligibleUsers.map((user) => user.id);

      for (let i = pool.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }

      const lectures = await this.lectureRepository
        .createQueryBuilder('lecture')
        .where('lecture.term_id = :termId', { termId })
        .andWhere('lecture.currentCount < lecture.maxCapacity')
        .orderBy('lecture.id', 'ASC')
        .getMany();

      const results: { lectureId: number; assignedCount: number }[] = [];

      await this.dataSource.transaction(async (manager) => {
        for (const lecture of lectures) {
          if (pool.length === 0) break;

          const lockedLecture = await manager.findOne(Lecture, {
            where: { id: lecture.id },
            lock: { mode: 'pessimistic_write' },
          });

          if (!lockedLecture) continue;

          const remaining =
            lockedLecture.maxCapacity - lockedLecture.currentCount;
          if (remaining <= 0) continue;

          const selected = pool.splice(0, remaining);
          if (selected.length === 0) break;

          const values = selected.map((userId) => ({
            lectureId: lockedLecture.id,
            userId,
          }));

          const insertResult = await manager
            .createQueryBuilder()
            .insert()
            .into(LectureEnrollment)
            .values(values)
            .orIgnore()
            .execute();

          const insertedCount = insertResult?.raw?.affectedRows ?? 0;

          if (insertedCount > 0) {
            await manager.increment(
              Lecture,
              { id: lockedLecture.id },
              'currentCount',
              insertedCount,
            );
          }

          results.push({
            lectureId: lockedLecture.id,
            assignedCount: insertedCount,
          });
        }
      });

      const totalAssigned = results.reduce(
        (sum, item) => sum + item.assignedCount,
        0,
      );

      return {
        totalAssigned,
        remainingEligible: pool.length,
        lectures: results,
      };
    } catch (error) {
      this.logger.error(
        `autoAssignLectures failed (termId=${termId})`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }
}
