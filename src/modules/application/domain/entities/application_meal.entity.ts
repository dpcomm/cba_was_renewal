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
import { Application } from '@modules/application/domain/entities/application.entity';
import { RetreatMeal } from '@modules/retreat/domain/entities/retreat_meal.entity';

@Entity('ApplicationMeal')
@Unique('ApplicationMeal_applicationId_retreatMealId_key', [
  'applicationId',
  'retreatMealId',
])
@Index('idx_application_meal_retreat_meal_id', ['retreatMealId'])
export class ApplicationMeal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'application_id' })
  applicationId: number;

  @Column({ name: 'retreat_meal_id' })
  retreatMealId: number;

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

  @ManyToOne(() => Application, (application) => application.applicationMeals, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'application_id',
    foreignKeyConstraintName: 'ApplicationMeal_applicationId_fkey',
  })
  application: Application;

  @ManyToOne(() => RetreatMeal, (retreatMeal) => retreatMeal.applicationMeals, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'retreat_meal_id',
    foreignKeyConstraintName: 'ApplicationMeal_retreatMealId_fkey',
  })
  retreatMeal: RetreatMeal;
}
