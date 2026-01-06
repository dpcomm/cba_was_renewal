import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { NoticeAuthorGroup } from '../notice-author.enum';

@Entity('Notice')
export class Notice {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 50})
    author: NoticeAuthorGroup;

    @Column({ length: 50 })
    title: string;

    @Column({ length: 191 })
    body: string;

    @CreateDateColumn({ type: 'datetime', precision: 3, default: () => 'CURRENT_TIMESTAMP(3)' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'datetime', precision: 3 })
    updatedAt: Date;
}