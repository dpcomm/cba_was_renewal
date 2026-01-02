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
import { User } from '@modules/user/domain/entities/user.entity';
import { CarpoolMember } from './carpool-member.entity';
import { Chat } from '@modules/chat/domain/entities/chat.entity';
import { ChatReport } from '@modules/chat/domain/entities/chat-report.entity';
import { CarpoolStatus } from '../../domain/carpool-status.enum';

@Entity('CarpoolRoom')
export class CarpoolRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ update: false })
  driverId: number;

  @Column({ nullable: true, length: 191 })
  carInfo: string;

  @Column({ type: 'datetime', precision: 3, default: () => 'CURRENT_TIMESTAMP(3)' })
  departureTime: Date;

  @Column({ length: 191 })
  origin: string;

  @Column({ nullable: true, length: 191 })
  originDetailed: string;

  @Column({ length: 191 })
  destination: string;

  @Column({ nullable: true, length: 191 })
  destinationDetailed: string;

  @Column({ name: 'seatsTotal' })
  seatsTotal: number;

  @Column({ name: 'seatsLeft' })
  seatsLeft: number;

  @Column({ length: 191 })
  note: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  originLat: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  originLng: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  destLat: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  destLng: number;

  @Column({ type: 'varchar', default: CarpoolStatus.Before_Departure, length: 50 })
  status: CarpoolStatus;

  @Column({ default: false })
  isArrived: boolean;

  @CreateDateColumn({ type: 'datetime', precision: 3, default: () => 'CURRENT_TIMESTAMP(3)' })
  createdAt: Date;

  @Column({ type: 'datetime', precision: 3 })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.createdRooms, { onDelete: 'RESTRICT', onUpdate: 'CASCADE' })
  @JoinColumn({
    name: 'driverId',
    foreignKeyConstraintName: 'CarpoolRoom_driverId_fkey',
  })
  driver: User;

  @OneToMany(() => CarpoolMember, (member) => member.room)
  members: CarpoolMember[];

  @OneToMany(() => Chat, (chat) => chat.room)
  chats: Chat[];

  @OneToMany(() => ChatReport, (report) => report.room)
  reports: ChatReport[];
}
