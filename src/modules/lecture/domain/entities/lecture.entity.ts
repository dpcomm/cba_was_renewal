import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { LectureEnrollment } from './lectureEnrollment.entity';
import { LectureSemester } from '../lecture-semester.enum';

// 검색 또는 분류를 위해 lecture_code를 사용
// lecture_code는 year(연도, 4자리), semester(학기, 3자리), codeNumber(코드번호, 3자리)로 구성됨
// year는 해당 강의가 시작하는 연도를 의미
// semester는 해당 강의가 시작한 학기 또는 분기를 의미
// - winter/summer retreat(겨울/여름 수련회) -> WIR, SUR
// - spring/summer/autumn/winter GBS (봄/여름/가을/겨울 GBS) -> SPG, SUG, AUG, WIG
// - extra semester 1,2,3 ... (추가) -> ES1, ES2, ES3
// codeNumber는 각 강의를 구분하기 위한 코드번호로 생성시 자동으로 부여.
// 해당 lecture_code는 unique한 특성을 가짐.
// ex. 2026WIR001 -> 2026년 겨울 수련회 001번 강의


@Entity('Lecture')
@Index('lecture_code',['year','semester','codeNumber'],{unique: true})
export class Lecture {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    introduction: string;

    @Column()
    instructor: string;

    @Column()
    location: string;

    @Column({ default: 0 })
    currentCount: number;

    @Column()
    maxCapacity: number;

    @Column({ type: 'datetime', precision: 3 })
    startTime: Date;

    @Column()
    year: number;

    @Column({ length: 10 })
    semester: string;

    @Column({ length: 10 })
    codeNumber: string;

    @CreateDateColumn({ type: 'datetime', precision: 3, default: () => 'CURRENT_TIMESTAMP(3)' })
    createdAt: Date;

    @Column({ type: 'datetime', precision: 3, default: () => 'CURRENT_TIMESTAMP(3)', onUpdate: 'CURRENT_TIMESTAMP(3)', })
    updatedAt: Date;

    @OneToMany(() => LectureEnrollment, enrollment => enrollment.lecture)
    enrollments: LectureEnrollment[];
}