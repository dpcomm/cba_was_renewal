import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.dev' });

const dataSource = new DataSource({
  type: 'mysql',
  url: process.env.DATABASE_URL,
  synchronize: false,
  logging: false,
  entities: [],
  migrations: [],
  subscribers: [],
});

async function checkMigration() {
  try {
    await dataSource.initialize();
    const queryRunner = dataSource.createQueryRunner();
    const result = await queryRunner.query("SELECT * FROM migrations WHERE name LIKE '%SyncLegacySchema%'");
    console.log('Migration Status:', result.length > 0 ? 'Executed' : 'Not Executed');
    await dataSource.destroy();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkMigration();
