import { Entity, Column, CreateDateColumn, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';
import { CarpoolRoom } from './carpool-room.entity';

@Entity('carpool_members')
export class CarpoolMember {
  @PrimaryColumn()
  roomId: number;

  @PrimaryColumn()
  userId: number;

  @CreateDateColumn()
  joinedAt: Date;

  @ManyToOne(() => User, (user) => user.joinedRooms)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => CarpoolRoom, (room) => room.members)
  @JoinColumn({ name: 'roomId' })
  room: CarpoolRoom;
}
