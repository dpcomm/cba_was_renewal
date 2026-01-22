import { AppDataSource } from '../src/infrastructure/database/data-source';
import { Term } from '../src/modules/term/domain/entities/term.entity';

async function check() {
  await AppDataSource.initialize();

  // Raw SQL로 조회
  const rawResult = await AppDataSource.query(
    'SELECT id, startDate, endDate FROM Term WHERE id = 4',
  );
  console.log('=== Raw SQL 결과 ===');
  console.log('DB raw:', rawResult[0]);

  // TypeORM으로 조회
  const termRepo = AppDataSource.getRepository(Term);
  const term = await termRepo.findOne({ where: { id: 4 } });

  console.log('\n=== TypeORM 엔티티 결과 ===');
  console.log('term.startDate:', term?.startDate);
  console.log('term.startDate.toISOString():', term?.startDate?.toISOString());
  console.log('typeof term.startDate:', typeof term?.startDate);

  console.log('\n=== 비교 ===');
  console.log('Raw DB startDate:', rawResult[0].startDate);
  console.log('TypeORM startDate:', term?.startDate);
  console.log('API 응답 (toISOString):', term?.startDate?.toISOString());

  await AppDataSource.destroy();
}

check();
