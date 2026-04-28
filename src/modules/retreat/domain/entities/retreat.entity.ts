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
import { RetreatMeal } from '@modules/retreat/domain/entities/retreat_meal.entity';
import { RetreatTransport } from '@modules/retreat/domain/entities/retreat_transport.entity';
import { Survey } from '@modules/application/domain/entities/survey.entity';

@Entity('Retreat')
export class Retreat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 191, name: 'title' })
  title: string;

  @Column({ length: 191, nullable: false, name: 'location' })
  location: string;

  @Column({
    type: 'datetime',
    precision: 3,
    name: 'retreat_start_at',
  })
  retreatStartAt: Date;

  @Column({
    type: 'datetime',
    precision: 3,
    nullable: false,
    name: 'retreat_end_at',
  })
  retreatEndAt: Date;

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

  @OneToMany(() => Application, (application) => application.retreat)
  applications: Application[];

  @OneToMany(() => Youtube, (youtube) => youtube.retreat)
  youtubes: Youtube[];

  @OneToMany(() => RetreatMeal, (meal) => meal.retreat)
  meals: RetreatMeal[];

  @OneToMany(() => RetreatTransport, (transport) => transport.retreat)
  transports: RetreatTransport[];

  @OneToMany(() => Survey, (survey) => survey.retreat)
  surveys: Survey[];
}
