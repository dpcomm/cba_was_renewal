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
import { Term } from '@modules/term/domain/entities/term.entity';


@Entity('Lecture')
@Index('uq_lecture_term_code', ['term', 'codeNumber'], { unique: true })
export class Lecture {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    introduction: string;

    @Column()
    instructor: string;

    @Column({ length: 255, default: 'CBA 대학청년부 선교사' })
    instructorBio: string;

    @Column()
    location: string;

    @Column({ default: 0 })
    currentCount: number;

    @Column()
    maxCapacity: number;

    @Column({ type: 'datetime', precision: 3 })
    startTime: Date;

    @ManyToOne(() => Term, {
      nullable: false,
      onDelete: 'RESTRICT',
    })
    @JoinColumn({ name: 'term_id' })
    term: Term;

    @Column({ length: 10 })
    codeNumber: string;

    @CreateDateColumn({ type: 'datetime', precision: 3, default: () => 'CURRENT_TIMESTAMP(3)' })
    createdAt: Date;

    @Column({ type: 'datetime', precision: 3, default: () => 'CURRENT_TIMESTAMP(3)', onUpdate: 'CURRENT_TIMESTAMP(3)', })
    updatedAt: Date;

    @OneToMany(() => LectureEnrollment, enrollment => enrollment.lecture)
    enrollments: LectureEnrollment[];
}