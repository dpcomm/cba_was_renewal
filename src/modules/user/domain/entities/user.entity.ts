import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Application } from '@modules/application/domain/entities/application.entity';
import { Pray } from '@modules/pray/domain/entities/pray.entity';
import { CarpoolRoom } from '@modules/carpool/domain/entities/carpool-room.entity';
import { CarpoolMember } from '@modules/carpool/domain/entities/carpool-member.entity';
import { Chat } from '@modules/chat/domain/entities/chat.entity';
import { FcmToken } from '@modules/fcm/domain/entities/fcm-token.entity';
import { ChatReport } from '@modules/chat/domain/entities/chat-report.entity';
import { Consent } from '@modules/consent/domain/entities/consent.entity';
import { LectureEnrollment } from '@modules/lecture/domain/entities/lectureEnrollment.entity';
@Entity('User')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'M', length: 191 })
  rank: string;

  @Column({ length: 191 })
  @Index('User_userId_key', { unique: true })
  userId: string;

  @Column({ length: 191 })
  password: string;

  @Column({ length: 191 })
  name: string;

  @Column({ length: 191 })
  group: string;

  @Column({ length: 191 })
  phone: string;

  @Column({ type: 'datetime', nullable: true, precision: 3 })
  birth: Date;

  @Column({ nullable: true, length: 191 })
  gender: string;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Index('IDX_User_email', { unique: true })
  email: string;

  @Column({ type: 'datetime', precision: 3, nullable: true })
  emailVerifiedAt: Date;

  @CreateDateColumn({
    type: 'datetime',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'datetime',
    precision: 3,
    default: () => 'CURRENT_TIMESTAMP(3)',
    onUpdate: 'CURRENT_TIMESTAMP(3)',
  })
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

  @OneToMany(() => LectureEnrollment, (enrollment) => enrollment.user)
  enrollments: LectureEnrollment[];
}
