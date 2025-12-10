import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '@modules/user/domain/entities/user.entity';

@Entity('FcmToken')
@Index('FcmToken_userId_idx', ['userId'])
export class FcmToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ length: 191 })
  @Index('FcmToken_token_key', { unique: true })
  token: string;

  @Column({ default: 'android', length: 191 })
  platform: string;

  @ManyToOne(() => User, (user) => user.tokens)
  @JoinColumn({ name: 'userId', foreignKeyConstraintName: 'FcmToken_userId_fkey' })
  user: User;
}
