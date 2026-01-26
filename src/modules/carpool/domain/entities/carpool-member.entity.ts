import {
  Entity,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  Index,
} from 'typeorm';
import { User } from '@modules/user/domain/entities/user.entity';
import { CarpoolRoom } from './carpool-room.entity';

@Entity('carpool_members')
export class CarpoolMember {
  @PrimaryColumn()
  roomId: number;

  @PrimaryColumn()
  userId: number;

  @CreateDateColumn({
    type: 'datetime',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
  })
  joinedAt: Date;

  @ManyToOne(() => User, (user) => user.joinedRooms, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'userId',
    foreignKeyConstraintName: 'carpool_members_userId_fkey',
  })
  user: User;

  @ManyToOne(() => CarpoolRoom, (room) => room.members, {
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({
    name: 'roomId',
    foreignKeyConstraintName: 'carpool_members_roomId_fkey',
  })
  room: CarpoolRoom;
}
