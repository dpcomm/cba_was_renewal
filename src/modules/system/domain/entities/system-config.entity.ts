import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

@Entity('SystemConfig')
export class SystemConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 191 })
  appName: string;

  @Column({ length: 50 })
  versionName: string;

  @Column({ type: 'int' })
  versionCode: number;

  @Column({ length: 500, nullable: true })
  privacyPolicyUrl: string;

  @Column({ type: 'int', default: 1 })
  privacyPolicyVersion: number;

  @Column({ type: 'int', nullable: true })
  currentTermId: number;

  @Column({ type: 'int', nullable: true })
  currentRetreatId: number;

  @UpdateDateColumn({
    type: 'datetime',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
    onUpdate: 'CURRENT_TIMESTAMP(3)',
  })
  updatedAt: Date;
}
