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

@Entity()
export class Retreat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  date: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Application, (application) => application.retreat)
  applications: Application[];

  @OneToMany(() => Youtube, (youtube) => youtube.retreat)
  youtubes: Youtube[];
}
