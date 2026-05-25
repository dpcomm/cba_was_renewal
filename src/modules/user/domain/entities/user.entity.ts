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

import { ChatReport } from '@modules/chat/domain/entities/chat-report.entity';
import { Consent } from '@modules/consent/domain/entities/consent.entity';
import { LectureEnrollment } from '@modules/lecture/domain/entities/lectureEnrollment.entity';
import { UserGroup } from '../enums/user-group.enum';
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

  @Column({
    type: 'enum',
    enum: UserGroup,
    default: UserGroup.ETC,
  })
  group: UserGroup;

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

  @OneToMany(() => ChatReport, (report) => report.reporter)
  reportsMade: ChatReport[];

  @OneToMany(() => ChatReport, (report) => report.reported)
  reportsReceived: ChatReport[];

  @OneToMany(() => Consent, (consent) => consent.user)
  consents: Consent[];

  @OneToMany(() => LectureEnrollment, (enrollment) => enrollment.user)
  enrollments: LectureEnrollment[];

  /**
   * 프로필 정보 수정
   */
  updateProfile(fields: {
    name?: string;
    group?: UserGroup;
    phone?: string;
    birth?: Date;
    gender?: string;
  }): void {
    if (fields.name !== undefined) this.name = fields.name;
    if (fields.group !== undefined) this.group = fields.group;
    if (fields.phone !== undefined) this.phone = fields.phone;
    if (fields.birth !== undefined) this.birth = fields.birth;
    if (fields.gender !== undefined) this.gender = fields.gender;
  }

  /**
   * 비밀번호 변경 (해싱된 비밀번호를 받음)
   */
  changePassword(hashedPassword: string): void {
    this.password = hashedPassword;
  }

  /**
   * 이메일 변경 + 인증 상태 초기화
   */
  changeEmail(newEmail: string): void {
    this.email = newEmail;
    this.emailVerifiedAt = null as unknown as Date;
  }

  /**
   * 이메일 인증 완료 처리
   */
  verifyEmail(): void {
    this.emailVerifiedAt = new Date();
  }

  /**
   * 회원 탈퇴 (Soft Delete)
   */
  softDelete(): void {
    this.isDeleted = true;
  }

  /**
   * 관리자용 등급 변경
   */
  changeRank(rank: string): void {
    this.rank = rank;
  }
}
