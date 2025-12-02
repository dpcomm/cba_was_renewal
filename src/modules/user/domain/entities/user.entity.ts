import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Application } from '@modules/application/domain/entities/application.entity';
import { Pray } from '@modules/pray/domain/entities/pray.entity';
import { CarpoolRoom } from '@modules/carpool/domain/entities/carpool-room.entity';
import { CarpoolMember } from '@modules/carpool/domain/entities/carpool-member.entity';
import { Chat } from '@modules/chat/domain/entities/chat.entity';
import { FcmToken } from '@modules/fcm/domain/entities/fcm-token.entity';
import { ChatReport } from '@modules/chat/domain/entities/chat-report.entity';
import { Consent } from '@modules/consent/domain/entities/consent.entity';

@Entity('User')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'M' })
  rank: string;

  @Column({ unique: true })
  userId: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column()
  group: string;

  @Column()
  phone: string;

  @Column({ type: 'datetime', nullable: true })
  birth: Date;

  @Column({ nullable: true })
  gender: string;

  @Column({ default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Application, (application) => application.user)
  applications: Application[];

  @OneToMany(() => Pray, (pray) => pray.user)
  prays: Pray[];

  @OneToMany(() => CarpoolRoom, (room) => room.driver)
  createdRooms: CarpoolRoom[];

  @OneToMany(() => CarpoolMember, (member) => member.user)
  joinedRooms: CarpoolMember[];

  @OneToMany(() => Chat, (chat) => chat.sender)
  chats: Chat[];

  @OneToMany(() => FcmToken, (token) => token.user)
  tokens: FcmToken[];

  @OneToMany(() => ChatReport, (report) => report.reporter)
  reportsMade: ChatReport[];

  @OneToMany(() => ChatReport, (report) => report.reported)
  reportsReceived: ChatReport[];

  @OneToMany(() => Consent, (consent) => consent.user)
  consents: Consent[];
}
