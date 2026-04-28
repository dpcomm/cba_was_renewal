import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Retreat } from '@modules/retreat/domain/entities/retreat.entity';
import { Application } from '@modules/application/domain/entities/application.entity';
import { Question } from './question.entity';

@Entity('Survey')
@Index('idx_survey_retreat_id', ['retreatId'])
export class Survey {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'retreat_id' })
  retreatId: number;

  @Column({
    type: 'datetime',
    precision: 3,
    name: 'survey_start_at',
  })
  surveyStartAt: Date;

  @Column({
    type: 'datetime',
    precision: 3,
    name: 'survey_end_at',
  })
  surveyEndAt: Date;

  @CreateDateColumn({
    type: 'datetime',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'datetime',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
    onUpdate: 'CURRENT_TIMESTAMP(3)',
    name: 'updated_at',
  })
  updatedAt: Date;

  @ManyToOne(() => Retreat, (retreat) => retreat.surveys, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'retreat_id',
    foreignKeyConstraintName: 'Survey_retreatId_fkey',
  })
  retreat: Retreat;

  @OneToMany(() => Question, (question) => question.survey)
  questions: Question[];

  @OneToMany(() => Application, (application) => application.survey)
  applications: Application[];
}
