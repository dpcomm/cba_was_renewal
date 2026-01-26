import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '@modules/user/domain/entities/user.entity';
import { CarpoolRoom } from '@modules/carpool/domain/entities/carpool-room.entity';

@Entity('ChatReport')
@Index('ChatReport_reporterId_idx', ['reporterId'])
@Index('ChatReport_reportedUserId_idx', ['reportedUserId'])
@Index('ChatReport_roomId_idx', ['roomId'])
export class ChatReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  reporterId: number;

  @Column()
  reportedUserId: number;

  @Column()
  roomId: number;

  @Column({ length: 191 })
  reason: string;

  @CreateDateColumn({
    type: 'datetime',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
  })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.reportsMade, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'reporterId',
    foreignKeyConstraintName: 'ChatReport_reporterId_fkey',
  })
  reporter: User;

  @ManyToOne(() => User, (user) => user.reportsReceived, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'reportedUserId',
    foreignKeyConstraintName: 'ChatReport_reportedUserId_fkey',
  })
  reported: User;

  @ManyToOne(() => CarpoolRoom, (room) => room.reports, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'roomId',
    foreignKeyConstraintName: 'ChatReport_roomId_fkey',
  })
  room: CarpoolRoom;
}
