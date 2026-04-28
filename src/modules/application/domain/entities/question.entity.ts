import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  OneToMany,
} from 'typeorm';
import { Survey } from './survey.entity';
import { QuestionOption } from './question_option.entity';
import { Answer } from './answer.entity';
import { AnswerType } from '../enum/survey.enum';

@Entity('Question')
@Unique('Question_surveyId_orderNo_key', ['surveyId', 'orderNo'])
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'survey_id' })
  surveyId: number;

  @Column({ length: 191 })
  title: string;

  @Column({ type: 'enum', enum: AnswerType, name: 'answer_type' })
  answerType: AnswerType;

  @Column({ type: 'int', name: 'order_no' })
  orderNo: number;

  @Column({ default: false, name: 'is_required' })
  isRequired: boolean;

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

  @ManyToOne(() => Survey, (survey) => survey.questions, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'survey_id',
    foreignKeyConstraintName: 'Question_surveyId_fkey',
  })
  survey: Survey;

  @OneToMany(() => QuestionOption, (option) => option.question)
  options: QuestionOption[];

  @OneToMany(() => Answer, (answer) => answer.question)
  answers: Answer[];
}
