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
import { Lecture } from './lecture.entity';
import { User } from '@modules/user/domain/entities/user.entity';

@Entity('LectureEnrollment')
@Index('lecture_enrollment_unique', ['lectureId', 'userId'], { unique: true }) 
export class LectureEnrollment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    lectureId: number;

    @Column()
    userId: number;

    @CreateDateColumn({ type: 'datetime', precision: 3, default: () => 'CURRENT_TIMESTAMP(3)' })
    enrolledAt: Date;

    @ManyToOne(() => Lecture, lecture => lecture.enrollments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'lectureId' })
    lecture: Lecture;

    @ManyToOne(() => User, user => user.enrollments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;
}