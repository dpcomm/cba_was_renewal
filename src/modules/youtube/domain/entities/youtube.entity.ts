import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Retreat } from '@modules/retreat/domain/entities/retreat.entity';

@Entity()
export class Youtube {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  retreatId: number;

  @Column()
  title: string;

  @Column({ length: 255 })
  link: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Retreat, (retreat) => retreat.youtubes)
  @JoinColumn({ name: 'retreatId' })
  retreat: Retreat;
}
