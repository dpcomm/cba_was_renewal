import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { Application } from './application.entity';
import { Question } from './question.entity';
import { QuestionOption } from './question_option.entity';

@Entity('Answer')
@Unique('Answer_applicationId_questionId_questionOptionId_key', [
  'applicationId',
  'questionId',
  'questionOptionId',
])
@Index('idx_answer_question_id', ['questionId'])
@Index('idx_answer_question_option_id', ['questionOptionId'])
@Index('idx_answer_application_question', ['applicationId', 'questionId'])
export class Answer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'question_id' })
  questionId: number;

  @Column({ name: 'application_id' })
  applicationId: number;

  @Column({ type: 'int', nullable: true, name: 'question_option_id' })
  questionOptionId: number | null;

  @Column({ type: 'text', nullable: true, name: 'content' })
  content: string | null;

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

  @ManyToOne(() => Question, (question) => question.answers, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'question_id',
    foreignKeyConstraintName: 'Answer_questionId_fkey',
  })
  question: Question;

  @ManyToOne(() => Application, (application) => application.answers, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'application_id',
    foreignKeyConstraintName: 'Answer_applicationId_fkey',
  })
  application: Application;

  @ManyToOne(() => QuestionOption, (option) => option.answers, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'question_option_id',
    foreignKeyConstraintName: 'Answer_questionOptionId_fkey',
  })
  questionOption: QuestionOption | null;
}
