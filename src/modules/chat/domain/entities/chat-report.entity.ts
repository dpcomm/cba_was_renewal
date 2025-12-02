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

@Entity()
@Index(['reporterId'])
@Index(['reportedUserId'])
@Index(['roomId'])
export class ChatReport {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  reporterId: number;

  @Column()
  reportedUserId: number;

  @Column()
  roomId: number;

  @Column()
  reason: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.reportsMade)
  @JoinColumn({ name: 'reporterId' })
  reporter: User;

  @ManyToOne(() => User, (user) => user.reportsReceived)
  @JoinColumn({ name: 'reportedUserId' })
  reported: User;

  @ManyToOne(() => CarpoolRoom, (room) => room.reports)
  @JoinColumn({ name: 'roomId' })
  room: CarpoolRoom;
}
