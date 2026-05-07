import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  OneToMany,
} from 'typeorm';
import { Retreat } from '@modules/retreat/domain/entities/retreat.entity';
import { ApplicationTransport } from '@modules/application/domain/entities/application_transport.entity';
import {
  TransportDirection,
  TransportType,
} from '../enum/retreat-transport.enum';

@Entity('RetreatTransport')
@Unique('RetreatTransport_retreatId_direction_type_name_key', [
  'retreatId',
  'direction',
  'transportType',
  'name',
])
export class RetreatTransport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'retreat_id' })
  retreatId: number;

  @Column({ type: 'enum', enum: TransportDirection })
  direction: TransportDirection;

  @Column({ type: 'enum', enum: TransportType, name: 'transport_type' })
  transportType: TransportType;

  @Column({ length: 191 })
  name: string;

  @Column({ default: false, name: 'is_remark_required' })
  isRemarkRequired: boolean;

  @Column({ default: false, name: 'is_vehicle_required' })
  isVehicleRequired: boolean;

  @CreateDateColumn({
    type: 'datetime',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
    name: 'created_at',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'datetime',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
    onUpdate: 'CURRENT_TIMESTAMP(3)',
    name: 'updated_at',
  })
  updatedAt: Date;

  @ManyToOne(() => Retreat, (retreat) => retreat.transports, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'retreat_id',
    foreignKeyConstraintName: 'RetreatTransport_retreatId_fkey',
  })
  retreat: Retreat;

  @OneToMany(
    () => ApplicationTransport,
    (applicationTransport) => applicationTransport.retreatTransport,
  )
  applicationTransports: ApplicationTransport[];

  /**
   * 교통 옵션 정보 수정
   */
  update(fields: {
    direction?: TransportDirection;
    transportType?: TransportType;
    name?: string;
    isRemarkRequired?: boolean;
    isVehicleRequired?: boolean;
  }): void {
    if (fields.direction !== undefined) this.direction = fields.direction;
    if (fields.transportType !== undefined) this.transportType = fields.transportType;
    if (fields.name !== undefined) this.name = fields.name;
    if (fields.isRemarkRequired !== undefined)
      this.isRemarkRequired = fields.isRemarkRequired;
    if (fields.isVehicleRequired !== undefined)
      this.isVehicleRequired = fields.isVehicleRequired;
  }
}
