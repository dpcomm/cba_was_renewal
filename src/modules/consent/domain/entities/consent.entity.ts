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
@Index(['userId'])
export class Consent {
  @PrimaryColumn()
  userId: number;

  @PrimaryColumn({ type: 'varchar', length: 191 })
  consentType: ConsentType;

  @CreateDateColumn()
  consentedAt: Date;

  @Column()
  value: boolean;

  @ManyToOne(() => User, (user) => user.consents)
  @JoinColumn({ name: 'userId' })
  user: User;
}
