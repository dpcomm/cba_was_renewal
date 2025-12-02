import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '@modules/user/domain/entities/user.entity';
import { CarpoolMember } from './carpool-member.entity';
import { Chat } from '@modules/chat/domain/entities/chat.entity';
import { ChatReport } from '@modules/chat/domain/entities/chat-report.entity';

@Entity()
export class CarpoolRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  driverId: number;

  @Column({ nullable: true })
  carInfo: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  departureTime: Date;

  @Column()
  origin: string;

  @Column({ nullable: true })
  originDetailed: string;

  @Column()
  destination: string;

  @Column({ nullable: true })
  destinationDetailed: string;

  @Column()
  seatsTotal: number;

  @Column()
  seatsLeft: number;

  @Column()
  note: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  originLat: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  originLng: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  destLat: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  destLng: number;

  @Column({ default: 'before_departure' })
  status: string;

  @Column({ default: false })
  isArrived: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.createdRooms)
  @JoinColumn({ name: 'driverId' })
  driver: User;

  @OneToMany(() => CarpoolMember, (member) => member.room)
  members: CarpoolMember[];

  @OneToMany(() => Chat, (chat) => chat.room)
  chats: Chat[];

  @OneToMany(() => ChatReport, (report) => report.room)
  reports: ChatReport[];
}
