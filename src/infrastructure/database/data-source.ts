import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { User } from '../../modules/user/domain/entities/user.entity';
import { CarpoolRoom } from '../../modules/carpool/domain/entities/carpool-room.entity';
import { CarpoolMember } from '../../modules/carpool/domain/entities/carpool-member.entity';
import { Chat } from '../../modules/chat/domain/entities/chat.entity';
import { ChatReport } from '../../modules/chat/domain/entities/chat-report.entity';
import { Pray } from '../../modules/pray/domain/entities/pray.entity';
import { Application } from '../../modules/application/domain/entities/application.entity';
import { Retreat } from '../../modules/retreat/domain/entities/retreat.entity';
import { Youtube } from '../../modules/youtube/domain/entities/youtube.entity';
import { FcmToken } from '../../modules/fcm/domain/entities/fcm-token.entity';
import { Consent } from '../../modules/consent/domain/entities/consent.entity';

const envFile = process.env.NODE_ENV === 'prod' ? '.env.prod' : '.env.dev';
dotenv.config({ path: envFile });

export const AppDataSource = new DataSource({
  type: 'mysql',
  url: process.env.DATABASE_URL,
  synchronize: false,
  logging: true,
  entities: [
    User,
    CarpoolRoom,
    CarpoolMember,
    Chat,
    ChatReport,
    Pray,
    Application,
    Retreat,
    Youtube,
    FcmToken,
    Consent,
  ],
  migrations: [join(__dirname, 'migrations', '*{.ts,.js}')],
  subscribers: [],
});
