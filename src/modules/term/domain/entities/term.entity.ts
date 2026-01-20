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
import { TermType } from './term-type.entity';
import { Lecture } from '@modules/lecture/domain/entities/lecture.entity';

@Entity('Term')
@Unique(['year', 'termType'])
export class Term {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int' })
    year: number;

    @ManyToOne(() => TermType, {
        nullable: false,
        onDelete: 'RESTRICT',
    })
    @JoinColumn({ name: 'term_type_id' })
    @Index()
    termType: TermType;

    @Column({ name: 'term_type_id' })
    termTypeId: number;


    @Column()
    startDate: Date;

    @Column()
    endDate: Date;

    @OneToMany(() => Lecture, (lecture) => lecture.term)
    lectures: Lecture[];


}
