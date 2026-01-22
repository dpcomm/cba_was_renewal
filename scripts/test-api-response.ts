import { AppDataSource } from '../src/infrastructure/database/data-source';
import { Term } from '../src/modules/term/domain/entities/term.entity';
import { Lecture } from '../src/modules/lecture/domain/entities/lecture.entity';

/**
 * This script simulates what the API would return for Term and Lecture data.
 * It shows the exact ISO strings that would be sent to the frontend.
 */
async function testApiResponse() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected!\n');

    const termRepo = AppDataSource.getRepository(Term);
    const lectureRepo = AppDataSource.getRepository(Lecture);

    // Simulate GET /term/:id response
    const term = await termRepo.findOne({
      where: { id: 4 },
    });

    if (term) {
      console.log('=== Term API Response (GET /term/4) ===');
      console.log('Raw DB value:');
      console.log('  startDate:', term.startDate);
      console.log('  endDate:', term.endDate);
      console.log('');
      console.log('API Response (toISOString()):');
      const termResponse = {
        id: term.id,
        name: term.name,
        description: term.description,
        startDate: term.startDate.toISOString(),
        endDate: term.endDate.toISOString(),
      };
      console.log(JSON.stringify(termResponse, null, 2));
      console.log('');
      console.log('>>> startDate in response:', termResponse.startDate);
      console.log('>>> 프론트에서 받으면: new Date("' + termResponse.startDate + '").toLocaleString("ko-KR") =>', 
        new Date(termResponse.startDate).toLocaleString('ko-KR'));
    }

    console.log('\n---\n');

    // Simulate GET /lecture/:id response
    const lecture = await lectureRepo.findOne({
      where: { id: 8 },
      relations: ['term'],
    });

    if (lecture) {
      console.log('=== Lecture API Response (GET /lecture/8) ===');
      console.log('Raw DB value:');
      console.log('  startTime:', lecture.startTime);
      console.log('');
      console.log('API Response (toISOString()):');
      const lectureResponse = {
        id: lecture.id,
        title: lecture.title,
        instructorName: lecture.instructor,
        location: lecture.location,
        startTime: lecture.startTime.toISOString(),
        currentCount: lecture.currentCount,
        maxCapacity: lecture.maxCapacity,
        termName: lecture.term?.name,
        codeNumber: lecture.codeNumber,
      };
      console.log(JSON.stringify(lectureResponse, null, 2));
      console.log('');
      console.log('>>> startTime in response:', lectureResponse.startTime);
      console.log('>>> 프론트에서 받으면: new Date("' + lectureResponse.startTime + '").toLocaleString("ko-KR") =>', 
        new Date(lectureResponse.startTime).toLocaleString('ko-KR'));
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

testApiResponse();
