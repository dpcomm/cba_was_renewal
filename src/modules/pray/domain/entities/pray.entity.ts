import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '@modules/user/domain/entities/user.entity';

@Entity('Pray')
export class Pray {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 191 })
  content: string;

  @CreateDateColumn({ type: 'datetime', precision: 3, default: () => 'CURRENT_TIMESTAMP(3)' })
  createdAt: Date;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.prays)
  @JoinColumn({ name: 'userId', foreignKeyConstraintName: 'Pray_userId_fkey' })
  user: User;
}
