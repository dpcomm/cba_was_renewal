import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { Application } from '@modules/application/domain/entities/application.entity';
import { RetreatTransport } from '@modules/retreat/domain/entities/retreat_transport.entity';
import { TransportDirection } from '@modules/retreat/domain/enum/retreat-transport.enum';

@Entity('ApplicationTransport')
@Unique('ApplicationTransport_applicationId_retreatTransportId_key', [
  'applicationId',
  'retreatTransportId',
])
@Unique('ApplicationTransport_applicationId_direction_key', [
  'applicationId',
  'direction',
])
@Index('idx_application_transport_retreat_transport_id', ['retreatTransportId'])
export class ApplicationTransport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'application_id' })
  applicationId: number;

  @Column({ name: 'retreat_transport_id' })
  retreatTransportId: number;

  @Column({
    type: 'varchar',
    length: 191,
    nullable: true,
    name: 'vehicle_number',
  })
  vehicleNumber: string | null;

  @Column({ type: 'varchar', length: 191, nullable: true, name: 'remark' })
  remark: string | null;

  @Column({ type: 'enum', enum: TransportDirection, name: 'direction' })
  direction: TransportDirection;

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

  @ManyToOne(
    () => Application,
    (application) => application.applicationTransports,
    {
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'application_id',
    foreignKeyConstraintName: 'ApplicationTransport_applicationId_fkey',
  })
  application: Application;

  @ManyToOne(
    () => RetreatTransport,
    (retreatTransport) => retreatTransport.applicationTransports,
    {
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'retreat_transport_id',
    foreignKeyConstraintName: 'ApplicationTransport_retreatTransportId_fkey',
  })
  retreatTransport: RetreatTransport;
}
