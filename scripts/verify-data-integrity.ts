// scripts/verify-data-integrity.ts
import { AppDataSource } from '../src/infrastructure/database/data-source';
import { Term } from '../src/modules/term/domain/entities/term.entity';
import { Lecture } from '../src/modules/lecture/domain/entities/lecture.entity';
import { CarpoolRoom } from '../src/modules/carpool/domain/entities/carpool-room.entity';

async function verifyData() {
  console.log(`\n=== Environment Check ===`);
  console.log(`process.env.TZ: ${process.env.TZ}`);
  console.log(`Current Date: ${new Date().toString()}`);

  try {
    await AppDataSource.initialize();
    console.log('\nDatabase connected!');

    // 1. Verify Term Data
    console.log('\n=== 1. Term Data Verification ===');
    const term = await AppDataSource.getRepository(Term).findOne({
      where: { id: 4 },
    });
    if (term) {
      console.log(`Term: ${term.name}`);
      console.log(
        `[DB Value] startDate: ${term.startDate.toISOString()} (Expected: 2026-01-22T04:00:00.000Z)`,
      );
      console.log(
        `[DB Value] endDate:   ${term.endDate.toISOString()}   (Expected: 2026-02-01T09:00:00.000Z)`,
      );

      // KST Conversion Check
      const kstStart = new Date(term.startDate).toLocaleString('ko-KR', {
        timeZone: 'Asia/Seoul',
      });
      console.log(`[KST Conv] startDate: ${kstStart} (Expected: 오후 1:00:00)`);
    } else {
      console.log('Term ID 4 not found.');
    }

    // 2. Verify Lecture Data
    console.log('\n=== 2. Lecture Data Verification ===');
    const lectures = await AppDataSource.getRepository(Lecture).find({
      take: 3,
      order: { id: 'DESC' },
    });
    if (lectures.length > 0) {
      lectures.forEach((l) => {
        console.log(`Lecture: [${l.codeNumber}] ${l.title}`);
        console.log(`[DB Value] startTime: ${l.startTime.toISOString()}`);
        const kstTime = new Date(l.startTime).toLocaleString('ko-KR', {
          timeZone: 'Asia/Seoul',
        });
        console.log(`[KST Conv] startTime: ${kstTime}`);
      });
    }

    // 3. Verify Carpool Data
    console.log('\n=== 3. Carpool Data Verification ===');
    // Fetch a few carpools to ensure dates look correct
    const carpools = await AppDataSource.getRepository(CarpoolRoom).find({
      take: 3,
      order: { id: 'DESC' },
    });
    if (carpools.length > 0) {
      carpools.forEach((c) => {
        console.log(
          `Carpool Room ID: ${c.id}, Origin: ${c.origin} -> Dest: ${c.destination}`,
        );
        console.log(
          `[DB Value] departureTime: ${c.departureTime.toISOString()}`,
        );
        const kstTime = new Date(c.departureTime).toLocaleString('ko-KR', {
          timeZone: 'Asia/Seoul',
        });
        console.log(`[KST Conv] departureTime: ${kstTime}`);
      });
    } else {
      console.log('No Carpool rooms found.');
    }
  } catch (error) {
    console.error('Error verifying data:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

verifyData();
