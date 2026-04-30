import { AppDataSource } from '../src/infrastructure/database/data-source';
import { Term } from '../src/modules/term/domain/entities/term.entity';
import { Lecture } from '../src/modules/lecture/domain/entities/lecture.entity';

async function checkData() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected!');

    const termRepo = AppDataSource.getRepository(Term);
    const lectureRepo = AppDataSource.getRepository(Lecture);

    const terms = await termRepo.find({
      relations: ['lectures'],
    });

    console.log('\n--- Term List ---');
    if (terms.length === 0) {
      console.log('No terms found.');
    } else {
      terms.forEach((term) => {
        console.log(
          `[${term.id}] ${term.name} (ISO: ${term.startDate.toISOString()} ~ ${term.endDate.toISOString()})`,
        );
        console.log(`    - Description: ${term.description}`);
        if (term.lectures && term.lectures.length > 0) {
          console.log(`    - Lectures (${term.lectures.length}):`);
          term.lectures.forEach((lecture) => {
            console.log(`        [${lecture.id}] ${lecture.title} (Code: ${lecture.codeNumber})`);
            console.log(`            Time (ISO): ${lecture.startTime.toISOString()} / Time (Local): ${lecture.startTime.toLocaleString()}`);
            console.log(`            Instructor: ${lecture.instructor}, Loc: ${lecture.location}, Count: ${lecture.currentCount}/${lecture.maxCapacity}`);
          });
        } else {
          console.log('    - No lectures');
        }
        console.log('');
      });
    }

    // Just in case there are lectures without term (should not happen due to FK)
    // or just to see all lectures flat
    const lectures = await lectureRepo.find({
      relations: ['term'],
    });
    console.log('\n--- All Lectures (Flat View) ---');
    if (lectures.length === 0) {
      console.log('No lectures found.');
    } else {
      lectures.forEach((l) => {
        console.log(`[${l.id}] ${l.title} (Term: ${l.term?.name})`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

checkData();
