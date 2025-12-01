import { Entity, Column, CreateDateColumn, ManyToOne, JoinColumn, PrimaryColumn, Index } from 'typeorm';
import { User } from './user.entity';

@Entity('user_consents')
@Index(['userId'])
export class Consent {
  @PrimaryColumn()
  userId: number;

  @PrimaryColumn()
  consentType: string;

  @CreateDateColumn()
  consentedAt: Date;

  @Column()
  value: boolean;

  @ManyToOne(() => User, (user) => user.consents)
  @JoinColumn({ name: 'userId' })
  user: User;
}
