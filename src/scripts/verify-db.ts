import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../entities/user.entity';
import { Application } from '../entities/application.entity';
import { Retreat } from '../entities/retreat.entity';
import { Youtube } from '../entities/youtube.entity';
import { Pray } from '../entities/pray.entity';
import { CarpoolRoom } from '../entities/carpool-room.entity';
import { CarpoolMember } from '../entities/carpool-member.entity';
import { Chat } from '../entities/chat.entity';
import { ChatReport } from '../entities/chat-report.entity';
import { FcmToken } from '../entities/fcm-token.entity';
import { Consent } from '../entities/consent.entity';

dotenv.config({ path: '.env.dev' });

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DOMAIN_LOCAL,
  port: 3306,
  username: 'root',
  password: process.env.MYSQL_ROOT_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  entities: [
    User, Application, Retreat, Youtube, Pray, CarpoolRoom, CarpoolMember, Chat, ChatReport, FcmToken, Consent
  ],
  synchronize: false,
  logging: true,
});

async function verify() {
  try {
    await dataSource.initialize();
    console.log('Database connection established successfully.');
    
    const userCount = await dataSource.getRepository(User).count();
    console.log(`Found ${userCount} users.`);

    await dataSource.destroy();
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1);
  }
}

verify();
