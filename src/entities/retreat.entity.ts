import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Application } from './application.entity';
import { Youtube } from './youtube.entity';

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
