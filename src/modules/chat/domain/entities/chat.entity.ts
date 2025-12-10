import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from '@modules/user/domain/entities/user.entity';
import { CarpoolRoom } from '@modules/carpool/domain/entities/carpool-room.entity';

@Entity('Chat')
@Unique(['senderId', 'roomId', 'message', 'timestamp'])
@Index(['roomId'])
@Index(['senderId'])
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  senderId: number;

  @Column()
  roomId: number;

  @Column()
  message: string;

  @Column()
  timestamp: Date;

  @ManyToOne(() => User, (user) => user.chats)
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @ManyToOne(() => CarpoolRoom, (room) => room.chats)
  @JoinColumn({ name: 'roomId' })
  room: CarpoolRoom;
}
