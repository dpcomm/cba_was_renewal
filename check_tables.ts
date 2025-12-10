import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.dev' });

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: false,
  logging: false,
  entities: [],
  migrations: [],
  subscribers: [],
});

async function checkTables() {
  try {
    await dataSource.initialize();
    const queryRunner = dataSource.createQueryRunner();
    const tables = await queryRunner.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'cbaapp'");
    console.log('Tables in cbaapp:', tables.map((t: any) => t.TABLE_NAME || t.table_name));
    await dataSource.destroy();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkTables();
