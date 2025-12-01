import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Application } from './application.entity';
import { Pray } from './pray.entity';
import { CarpoolRoom } from './carpool-room.entity';
import { CarpoolMember } from './carpool-member.entity';
import { Chat } from './chat.entity';
import { FcmToken } from './fcm-token.entity';
import { ChatReport } from './chat-report.entity';
import { Consent } from './consent.entity';

@Entity()
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
