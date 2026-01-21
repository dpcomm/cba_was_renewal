// term-type.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  Unique,
  Index
} from 'typeorm';

@Entity('Term_type')
export class TermType {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

}
