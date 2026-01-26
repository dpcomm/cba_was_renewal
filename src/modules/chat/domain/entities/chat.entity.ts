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
@Unique('Chat_senderId_roomId_message_timestamp_key', [
  'senderId',
  'roomId',
  'message',
  'timestamp',
])
@Index('Chat_roomId_idx', ['roomId'])
@Index('Chat_senderId_idx', ['senderId'])
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  senderId: number;

  @Column()
  roomId: number;

  @Column({ length: 191 })
  message: string;

  @Column({ type: 'datetime', precision: 3 })
  timestamp: Date;

  @ManyToOne(() => User, (user) => user.chats, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'senderId',
    foreignKeyConstraintName: 'Chat_senderId_fkey',
  })
  sender: User;

  @ManyToOne(() => CarpoolRoom, (room) => room.chats, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'roomId', foreignKeyConstraintName: 'Chat_roomId_fkey' })
  room: CarpoolRoom;
}
