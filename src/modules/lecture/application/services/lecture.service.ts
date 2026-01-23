import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository, DataSource, Not } from 'typeorm';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';

import { Lecture } from '@modules/lecture/domain/entities/lecture.entity';
import { LectureEnrollment } from '@modules/lecture/domain/entities/lectureEnrollment.entity';
import {
  createLectureRequestDto,
  updateLectureRequestDto,
  enrollLectureRequestDto,
  dropLectureRequestDto,
} from '../dto/lecture.request.dto';
import {
  LectureResponseDto,
  LectureDetailResponseDto,
} from '@modules/lecture/presentation/dto/lecture.response.dto';

import { User } from '@modules/user/domain/entities/user.entity';

@Injectable()
export class LectureService {
  constructor(
    @InjectRepository(Lecture)
    private lectureRepository: Repository<Lecture>,
    @InjectRepository(LectureEnrollment)
    private lecutreEnrollmentRepository: Repository<LectureEnrollment>,
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
  ): Promise<LectureDetailResponseDto> {
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

    return lectureWithRelations;
  }

  // lecture 삭제
  async deleteLecture(lectureId: number): Promise<void> {
    await this.lectureRepository.delete({ id: lectureId });
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

      return enrollment;
    });
  }
}
