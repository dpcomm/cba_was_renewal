import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Application } from '@modules/application/domain/entities/application.entity';
import { Youtube } from '@modules/youtube/domain/entities/youtube.entity';

@Entity('Retreat')
export class Retreat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 191 })
  title: string;

  @Column({ type: 'datetime', precision: 3 })
  date: Date;

  @CreateDateColumn({ type: 'datetime', precision: 3, default: () => 'CURRENT_TIMESTAMP(3)' })
  createdAt: Date;

  @Column({ type: 'datetime', precision: 3 })
  updatedAt: Date;

  @OneToMany(() => Application, (application) => application.retreat)
  applications: Application[];

  @OneToMany(() => Youtube, (youtube) => youtube.retreat)
  youtubes: Youtube[];
}
