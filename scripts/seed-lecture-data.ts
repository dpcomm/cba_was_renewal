import { AppDataSource } from '../src/infrastructure/database/data-source';
import { Term } from '../src/modules/term/domain/entities/term.entity';
import { Lecture } from '../src/modules/lecture/domain/entities/lecture.entity';

async function seedData() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected!');

    const termRepo = AppDataSource.getRepository(Term);
    const lectureRepo = AppDataSource.getRepository(Lecture);

    // Check if term already exists
    let term = await termRepo.findOne({
      where: { name: '2026 겨울수련회 선택식강의' },
    });

    if (!term) {
      term = termRepo.create({
        name: '2026 겨울수련회 선택식강의',
        description: '2026년 겨울 수련회 선택식 강의입니다. 신청 기간: 1월 25일(일) ~ 2월 1일(토)',
        startDate: new Date('2026-01-22T04:00:00Z'), // 13:00 KST
        endDate: new Date('2026-02-01T09:00:00Z'), // 18:00 KST (assuming 18:00, or keep original logic)
      });
      term = await termRepo.save(term);
      console.log(`Term created: [${term.id}] ${term.name}`);
    } else {
      console.log(`Term already exists: [${term.id}] ${term.name}`);
      // Update start date for existing term
      term.startDate = new Date('2026-01-22T04:00:00Z'); // 13:00 KST
      term.endDate = new Date('2026-02-01T09:00:00Z');
      await termRepo.save(term);
      console.log(`Term updated: [${term.id}] Start Date -> 2026-01-22 04:00 UTC (13:00 KST)`);
    }

    const lectureTime = new Date('2026-01-31T04:30:00+09:00'); // Store as 04:30 (UTC) for 13:30 KST

    const lecturesData = [
      {
        title: '쓸데없는 참견',
        instructor: '송경호',
        introduction:
          '아동복지의 현실 그리고 교회사회사업으로서의 가치와 방향 등으로 나눌 예정입니다. 또한 현장에 대한 실제 사례들을 중심으로 진정으로 기독교인이 추구해야 할 복지적 가치, 그 중에서 아동이라는 세대가 주는 중요성을 나누도록 하겠습니다',
        location: '미정',
        maxCapacity: 1,
        codeNumber: '001',
      },
      {
        title: '예수와 여제자들',
        instructor: '김성희',
        introduction:
          '예수 그리스도의 하나님나라 사역이 여성 제자들과 함께하고 있음을 알리며, 연대와 긍휼이라는 진정한 제자도의 모습을 보여주고 있는 여제자들의 모습을 통해 제자의 의미를 되살리고 우리의 모델로 삼고자 한다.',
        location: '미정',
        maxCapacity: 2,
        codeNumber: '002',
      },
      {
        title: "'교회의 선교'(미시오 에클레시아)에서 '하나님의 선교'(미시오 데이)로 나아가자",
        instructor: '백종호',
        introduction:
          "선교는 교회의 여러가지 기능 중에 하나가 아니라 교회 전체의 방향과 사명을 담아내는 최우선의 역할이다. 선교의 주체는 교회가 아니라, 하나님이시다. 성경 전체는 세상을 향한, 세상을 위한 하나님의 선교(Missio Dei)를 증언한다.",
        location: '미정',
        maxCapacity: 1,
        codeNumber: '003',
      },
      {
        title: '아직 정해지지 않은 인생은 실패일까?-성경이 말하는 \'방향 없는 시기\'',
        instructor: '한세리',
        introduction:
          "혼란과 불안함에 대해 성경은 정답을 줄까? 아니면 읽을 수 있는 관점을 줄까? '꿈이 없다'는 상태를 실패로 보지 않고, 성경이 이 시기를 어떻게 다르게 해석하는지 함께 생각해보는 시간.",
        location: '미정',
        maxCapacity: 2,
        codeNumber: '004',
      },
    ];

    for (const data of lecturesData) {
      const existing = await lectureRepo.findOne({
        where: { term: { id: term.id }, codeNumber: data.codeNumber },
      });

      if (existing) {
        console.log(`Updating existing lecture: [${data.codeNumber}] ${data.title}`);
        existing.startTime = lectureTime;
        existing.title = data.title;
        existing.instructor = data.instructor;
        existing.introduction = data.introduction;
        existing.maxCapacity = data.maxCapacity;
        await lectureRepo.save(existing);
        continue;
      }

      const lecture = lectureRepo.create({
        ...data,
        startTime: lectureTime,
        term: { id: term.id },
      });
      await lectureRepo.save(lecture);
      console.log(`Lecture created: [${data.codeNumber}] ${data.title}`);
    }

    console.log('\nSeeding completed!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

seedData();
