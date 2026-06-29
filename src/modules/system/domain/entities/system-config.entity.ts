import { Retreat } from '@modules/retreat/domain/entities/retreat.entity';
import { Term } from '@modules/term/domain/entities/term.entity';
import {
  Entity,
  Column,
  UpdateDateColumn,
  PrimaryColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

export interface UpdateSystemConfigValues {
  appName?: string;
  versionName?: string;
  versionCode?: number;
  minimumVersionCode?: number;
  privacyPolicyUrl?: string | null;
  privacyPolicyVersion?: number;
  privacyPolicyUpdatedAt?: Date | null;
  maintenanceMode?: boolean;
  maintenanceMessage?: string | null;
  currentTermId?: number | null;
  currentRetreatId?: number | null;
}

@Entity('SystemConfig')
export class SystemConfig {
  @PrimaryColumn({
    type: 'int',
    default: 1,
  })
  id!: number;

  @Column({
    name: 'app_name',
    length: 191,
  })
  appName!: string;

  @Column({
    name: 'version_name',
    length: 50,
  })
  versionName!: string;

  @Column({
    name: 'version_code',
    type: 'int',
  })
  versionCode!: number;

  @Column({
    name: 'minimum_version_code',
    type: 'int',
    default: 1,
  })
  minimumVersionCode!: number;

  @Column({
    name: 'privacy_policy_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  privacyPolicyUrl!: string | null;

  @Column({
    name: 'privacy_policy_version',
    type: 'int',
    default: 1,
  })
  privacyPolicyVersion!: number;

  @Column({
    name: 'privacy_policy_updated_at',
    type: 'datetime',
    precision: 3,
    nullable: true,
  })
  privacyPolicyUpdatedAt!: Date | null;

  @Column({
    name: 'maintenance_mode',
    type: 'boolean',
    default: false,
  })
  maintenanceMode!: boolean;

  @Column({
    name: 'maintenance_message',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  maintenanceMessage!: string | null;

  @Column({
    name: 'current_term_id',
    type: 'int',
    nullable: true,
  })
  currentTermId!: number | null;

  @ManyToOne(() => Term, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'current_term_id' })
  currentTerm!: Term | null;

  @Column({
    name: 'current_retreat_id',
    type: 'int',
    nullable: true,
  })
  currentRetreatId!: number | null;

  @ManyToOne(() => Retreat, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'current_retreat_id' })
  currentRetreat!: Retreat | null;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'datetime',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
    onUpdate: 'CURRENT_TIMESTAMP(3)',
  })
  updatedAt!: Date;

  update(values: UpdateSystemConfigValues): void {
    Object.assign(this, values);
    this.id = 1;
  }
}
