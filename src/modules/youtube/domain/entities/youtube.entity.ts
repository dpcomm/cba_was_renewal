import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Retreat } from '@modules/retreat/domain/entities/retreat.entity';

@Entity('Youtube')
export class Youtube {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  retreatId: number;

  @Column({ length: 191 })
  title: string;

  @Column({ length: 255 })
  link: string;

  @CreateDateColumn({
    type: 'datetime',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
  })
  createdAt: Date;

  @ManyToOne(() => Retreat, (retreat) => retreat.youtubes, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'retreatId',
    foreignKeyConstraintName: 'Youtube_retreatId_fkey',
  })
  retreat: Retreat;
}
