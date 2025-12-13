import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '@modules/user/domain/entities/user.entity';
import { Platform } from '../platform.enum';

@Entity('FcmToken')
@Index('FcmToken_userId_idx', ['userId'])
export class FcmToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({nullable: true})
  userId: number | null;

  @Column({ length: 191 })
  @Index('FcmToken_token_key', { unique: true })
  token: string;

  @Column({ default: Platform.Android, length: 191 })
  platform: Platform;

  @ManyToOne(() => User, (user) => user.tokens, {
    nullable: true,
    onDelete: 'SET NULL'
  })
  @JoinColumn({ name: 'userId', foreignKeyConstraintName: 'FcmToken_userId_fkey' })
  user?: User | null;
}
