import { AppDataSource } from '../src/infrastructure/database/data-source';
import { Lecture } from '../src/modules/lecture/domain/entities/lecture.entity';

async function verify() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected!');

    const lectures = await AppDataSource.getRepository(Lecture).find({
      order: { codeNumber: 'ASC' },
    });

    console.log('\n--- Lecture Data Verification ---');
    lectures.forEach((l) => {
      console.log(`[${l.codeNumber}] ${l.title}`);
      console.log(` - Instructor: ${l.instructor}`);
      console.log(` - Bio: ${l.instructorBio}`);
      console.log('-----------------------------------');
    });
  } catch (error) {
    console.error(error);
  } finally {
    await AppDataSource.destroy();
  }
}

verify();
