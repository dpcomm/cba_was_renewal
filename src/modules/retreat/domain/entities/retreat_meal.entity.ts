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
import { Retreat } from '@modules/retreat/domain/entities/retreat.entity';
import { ApplicationMeal } from '@modules/application/domain/entities/application_meal.entity';
import { MealType } from '../enum/retreat-meal.enum';

@Entity('RetreatMeal')
@Unique('RetreatMeal_retreatId_mealDay_mealType_key', [
  'retreatId',
  'mealDay',
  'mealType',
])
export class RetreatMeal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'retreat_id' })
  retreatId: number;

  @Column({ type: 'date', name: 'meal_day' })
  mealDay: string;

  @Column({ type: 'enum', enum: MealType, name: 'meal_type' })
  mealType: MealType;

  @Column({ type: 'simple-json', name: 'meal_table', nullable: true })
  mealTable: string[] | null;

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

  @ManyToOne(() => Retreat, (retreat) => retreat.meals, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'retreat_id',
    foreignKeyConstraintName: 'RetreatMeal_retreatId_fkey',
  })
  retreat: Retreat;

  @OneToMany(
    () => ApplicationMeal,
    (applicationMeal) => applicationMeal.retreatMeal,
  )
  applicationMeals: ApplicationMeal[];
}
