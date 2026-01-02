import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '@modules/user/domain/entities/user.entity';
import { Retreat } from '@modules/retreat/domain/entities/retreat.entity';

@Entity('Application')
@Unique('Application_userId_retreatId_key', ['userId', 'retreatId'])
export class Application {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 191 })
  idn: string;

  @Column({ type: 'json' })
  surveyData: any;

  @Column({ default: false })
  attended: boolean;

  @Column({ default: false })
  feePaid: boolean;

  @CreateDateColumn({ type: 'datetime', precision: 3, default: () => 'CURRENT_TIMESTAMP(3)' })
  createdAt: Date;

  @Column({ type: 'datetime', precision: 3 })
  updatedAt: Date;

  @Column({ length: 191 })
  userId: string;

  @Column()
  retreatId: number;

  @ManyToOne(() => User, (user) => user.applications, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'userId', referencedColumnName: 'userId', foreignKeyConstraintName: 'Application_userId_fkey' })
  user: User;

  @ManyToOne(() => Retreat, (retreat) => retreat.applications, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'retreatId', foreignKeyConstraintName: 'Application_retreatId_fkey' })
  retreat: Retreat;
}
