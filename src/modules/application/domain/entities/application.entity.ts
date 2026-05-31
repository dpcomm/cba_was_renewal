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
  Index,
} from 'typeorm';
import { User } from '@modules/user/domain/entities/user.entity';
import { Retreat } from '@modules/retreat/domain/entities/retreat.entity';
import {
  EventResult,
  ApplicationStatus,
  PaymentStatus,
} from '../enum/application.enum';
import { ApplicationMeal } from './application_meal.entity';
import { ApplicationTransport } from './application_transport.entity';
import { Answer } from './answer.entity';
import { Survey } from './survey.entity';

@Entity('Application')
@Unique('Application_userId_retreatId_key', ['userId', 'retreatId'])
@Index('idx_application_retreat_status', ['retreatId', 'status'])
@Index('idx_application_retreat_status_payment', [
  'retreatId',
  'status',
  'paymentStatus',
])
@Index('idx_application_survey_id', ['surveyId'])
@Index('idx_application_user_id', ['userId'])
@Index('idx_application_retreat_payment', ['retreatId', 'paymentStatus'])
@Index('idx_application_retreat_checkedin', ['retreatId', 'checkedInAt'])
export class Application {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.SUBMITTED,
    name: 'status',
  })
  status: ApplicationStatus;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
    name: 'payment_status',
  })
  paymentStatus: PaymentStatus;

  @Column({
    type: 'datetime',
    precision: 3,
    nullable: true,
    name: 'checked_in_at',
  })
  checkedInAt: Date;

  @Column({
    type: 'enum',
    enum: EventResult,
    nullable: true,
    name: 'event_result',
  })
  eventResult: EventResult;

  @Column({
    type: 'datetime',
    precision: 3,
    nullable: true,
    name: 'event_participated_at',
  })
  eventParticipatedAt: Date;

  @Column({ type: 'text', nullable: true, name: 'admin_memo' })
  adminMemo: string | null;

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

  @Column({ length: 191, name: 'user_id' })
  userId: string;

  @Column({ name: 'retreat_id' })
  retreatId: number;

  @Column({ nullable: false, name: 'survey_id' })
  surveyId: number;

  @ManyToOne(() => Survey, (survey) => survey.applications, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'survey_id',
    foreignKeyConstraintName: 'Application_surveyId_fkey',
  })
  survey: Survey;

  @ManyToOne(() => User, (user) => user.applications, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'userId',
    foreignKeyConstraintName: 'Application_userId_fkey',
  })
  user: User;

  @ManyToOne(() => Retreat, (retreat) => retreat.applications, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'retreat_id',
    foreignKeyConstraintName: 'Application_retreatId_fkey',
  })
  retreat: Retreat;

  @OneToMany(() => ApplicationMeal, (meal) => meal.application)
  applicationMeals: ApplicationMeal[];

  @OneToMany(() => ApplicationTransport, (transport) => transport.application)
  applicationTransports: ApplicationTransport[];

  @OneToMany(() => Answer, (answer) => answer.application)
  answers: Answer[];
}
