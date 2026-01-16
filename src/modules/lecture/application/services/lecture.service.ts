import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository, DataSource, Not } from 'typeorm';
import { ERROR_MESSAGES } from '@shared/constants/error-messages';

import { Lecture } from '@modules/lecture/domain/entities/lecture.entity';
import { LectureEnrollment } from '@modules/lecture/domain/entities/lectureEnrollment.entity';
import { LectureSemester } from '@modules/lecture/domain/lecture-semester.enum';
import { 
    createLectureRequestDto,
    updateLectureRequestDto,
    enrollLectureRequestDto,
    dropLectureRequestDto,
    getLectureFilterDto,
} from '../dto/lecture.request.dto';
import { 
    LectureResponseDto,
    LectureDetailResponseDto 
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
    async getLectures(filter: getLectureFilterDto): Promise<Lecture[]> {
        const queryBuilder = this.lectureRepository.createQueryBuilder('lecture');

        if (filter.year) {
            queryBuilder.andWhere('lecture.year=:year',{ year:filter.year });
        }
        if (filter.semester) {
            queryBuilder.andWhere('lecture.semester=:semester',{ semester:filter.semester });
        }
        if (filter.codeNumber) {
            queryBuilder.andWhere('lecture.codeNumber=:codeNumber',{ codeNumber:filter.codeNumber });
        }

        return await queryBuilder.orderBy('lecture.year','DESC').getMany();            
    }

    // id에 따른 lecture 정보 조회
    async getLectureById(lectureId: number): Promise<Lecture> {
        const lecture = await this.lectureRepository.findOne({where:{id:lectureId}});

        if (!lecture) {
            throw new NotFoundException(ERROR_MESSAGES.LECTURE_NOT_FOUND)
        }

        return lecture;
    }

    // id에 따른 참여자 정보를 포함한 lecture 정보 조회
    async getLectureDetailById(lectureId: number): Promise<LectureDetailResponseDto> {
        const lecture = await this.lectureRepository.findOne({
            where: { id: lectureId },
            relations: ['enrollments', 'enrollments.user']
        });        

        if (!lecture) {
            throw new NotFoundException(ERROR_MESSAGES.LECTURE_NOT_FOUND);
        }

        return {
            id: lecture.id,
            title: lecture.title,
            instructorName: lecture.instructor,
            location: lecture.location,
            startTime: lecture.startTime.toISOString(),
            currentCount: lecture.currentCount,
            maxCapacity: lecture.maxCapacity,
            year: lecture.year,
            semester: lecture.semester,
            codeNumber: lecture.codeNumber,
            introduction: lecture.introduction,
            enrollees: lecture.enrollments.map(enrollment => ({
                id: enrollment.user.id,
                name: enrollment.user.name,
                group: enrollment.user.group,
            })),
        };
    }

    // lecture 생성
    async createLecture(dto: createLectureRequestDto): Promise<Lecture> {
        // 중복 체크 (year + semester)
        const existingLecture = await this.lectureRepository.findOne({
            where: {
                year: dto.year,
                semester: dto.semester,
            },
        });

        // codeNumber 자동 생성 (3자리, 001부터 시작)
        let codeNumber = '001';
        if (existingLecture) {
            const maxCode = await this.lectureRepository
            .createQueryBuilder('lecture')
            .select('MAX(CAST(lecture.codeNumber AS UNSIGNED))', 'maxCode')
            .where('lecture.year = :year', { year: dto.year })
            .andWhere('lecture.semester = :semester', { semester: dto.semester })
            .getRawOne();
            
            const nextNumber = (parseInt(maxCode.maxCode || '0') + 1).toString().padStart(3, '0');
            codeNumber = nextNumber;
        }

        // DTO → Entity 변환 (codeNumber 자동 추가)
        const lecture = this.lectureRepository.create({
            title: dto.title,
            introduction: dto.introduction,
            instructor: dto.instructor,
            location: dto.location,
            maxCapacity: dto.maxCapacity,
            startTime: new Date(dto.startTime),
            year: dto.year,
            semester: dto.semester,            
            codeNumber,  // 자동 생성된 코드
        });

        const savedLecture = await this.lectureRepository.save(lecture);
        return savedLecture;        
    }

    // lecture 수정
    async updateLecture(dto: updateLectureRequestDto): Promise<Lecture> {
        const existing = await this.lectureRepository.findOne({where: {id: dto.id}});

        if (!existing) {
            throw new NotFoundException(ERROR_MESSAGES.LECTURE_NOT_FOUND);
        }

        // maxCapacity 검증 (수정 시에만)
        if (dto.maxCapacity !== undefined && dto.maxCapacity < existing.currentCount) {
            throw new BadRequestException(
                `maxCapacity(${dto.maxCapacity})는 현재 인원(${existing.currentCount})보다 클 수 없습니다`
            );
        }

        // 명시적 업데이트 필드 정의
        const updatableFields: (keyof updateLectureRequestDto)[] = [
            'title',
            'introduction', 
            'instructor',
            'location',
            'maxCapacity',
            'startTime',
        ];

        // null/undefined 제외하고만 업데이트
        for (const key of updatableFields) {
            const value = dto[key];
            if (value == null) continue;

            if (key === 'startTime') {
                existing.startTime = new Date(value as any);
            } else {
                (existing as any)[key] = value;
            }
        }

        return await this.lectureRepository.save(existing);   
    }

    // lecture 삭제
    async deleteLecture(lectureId: number): Promise<void> {
        await this.lectureRepository.delete({id: lectureId});
    }

    // lecture 신청
    async enrollLecture(dto: enrollLectureRequestDto): Promise<void> {

    }

    // lecture 신청 취소
    async dropLecture(dto: dropLectureRequestDto): Promise<void> {
        await this.dataSource.transaction(async (manager) => {
            const enrollment = await manager.findOne(LectureEnrollment, {
                where: {
                    lecture: { id: dto.lectureId },
                    user: { id: dto.userId }
                },
                relations: ['lecture', 'user'],
                lock: { mode: 'pessimistic_write' }  
            });

            if (!enrollment) {
                throw new NotFoundException(ERROR_MESSAGES.ENROLLMENT_NOT_FOUND);
            }

            // currentCount 원자적 감소
            await manager.decrement(Lecture, { id: dto.lectureId }, 'currentCount', 1);
            
            // enrollment 삭제
            await manager.remove(LectureEnrollment, enrollment);
            
            return enrollment;
        });
    }

}