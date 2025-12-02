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

@Entity()
@Unique(['userId', 'retreatId'])
export class Application {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  idn: string;

  @Column({ type: 'json' })
  surveyData: any;

  @Column({ default: false })
  attended: boolean;

  @Column({ default: false })
  feePaid: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  userId: string;

  @Column()
  retreatId: number;

  @ManyToOne(() => User, (user) => user.applications)
  @JoinColumn({ name: 'userId', referencedColumnName: 'userId' })
  user: User;

  @ManyToOne(() => Retreat, (retreat) => retreat.applications)
  @JoinColumn({ name: 'retreatId' })
  retreat: Retreat;
}
