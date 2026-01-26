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

  @Column()
  userId: number;

  @Column({ length: 191 })
  @Index('FcmToken_token_key', { unique: true })
  token: string;

  @Column({ type: 'varchar', default: Platform.Android, length: 191 })
  platform: Platform;

  @ManyToOne(() => User, (user) => user.tokens, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'userId',
    foreignKeyConstraintName: 'FcmToken_userId_fkey',
  })
  user: User;
}
