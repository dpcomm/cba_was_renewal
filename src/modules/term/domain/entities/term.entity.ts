// term.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { Lecture } from '@modules/lecture/domain/entities/lecture.entity';

@Entity('Term')
export class Term {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ type: 'varchar', length: 255, default: '' })
    description: string;

    @Column()
    startDate: Date;

    @Column()
    endDate: Date;

    @OneToMany(() => Lecture, (lecture) => lecture.term)
    lectures: Lecture[];


}
