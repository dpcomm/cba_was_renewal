import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { User } from './user.entity';
import { CarpoolRoom } from './carpool-room.entity';

@Entity()
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
