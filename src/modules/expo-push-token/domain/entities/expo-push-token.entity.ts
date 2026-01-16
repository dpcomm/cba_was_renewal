import { 
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    Index,
    JoinColumn,
} from "typeorm";
import { User } from "@modules/user/domain/entities/user.entity";

@Entity('ExpoPushToken')
@Index('ExpoPushToken_userId_idx', ['userId'])
export class ExpoPushToken {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    userId: number;

    @Column({ length: 191 })
    @Index('ExpoPushToken_token_key', { unique: true})
    token: string;

    @Column({ default: 'expo' })
    provider: 'expo';

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId'})
    user: User;

    @Column({ type: 'timestamp', nullable: true })
    lastUsedAt?: Date;

    @CreateDateColumn()
    createdAt: Date;    
}