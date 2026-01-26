import {
  Entity,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  Index,
} from 'typeorm';
import { User } from '@modules/user/domain/entities/user.entity';
import { ConsentType } from '../consent-type.enum';

@Entity('user_consents')
@Index('user_consents_userId_idx', ['userId'])
export class Consent {
  @PrimaryColumn()
  userId: number;

  @PrimaryColumn({ type: 'varchar', length: 191 })
  consentType: ConsentType;

  @CreateDateColumn({
    type: 'datetime',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
  })
  consentedAt: Date;

  @Column()
  value: boolean;

  @ManyToOne(() => User, (user) => user.consents, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'userId',
    foreignKeyConstraintName: 'user_consents_userId_fkey',
  })
  user: User;
}
