import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { User } from '../src/modules/user/domain/entities/user.entity';
import { Retreat } from '../src/modules/retreat/domain/entities/retreat.entity';
import { Application } from '../src/modules/application/domain/entities/application.entity';
import { UserRank } from '../src/modules/user/domain/enums/user-rank.enum';
import { EventResult } from '../src/modules/application/domain/enum/application.enum';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

describe('Application Event Limit (E2E)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let jwtService: JwtService;

  let retreatId: number;
  let targetUserToken: string;
  let targetUserIdStr: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    dataSource = app.get(DataSource);
    jwtService = app.get(JwtService);

    await seedData();
  }, 60000);

  afterAll(async () => {
    await app.close();
  });

  async function seedData() {
    const userRepo = dataSource.getRepository(User);
    const retreatRepo = dataSource.getRepository(Retreat);
    const appRepo = dataSource.getRepository(Application);

    // 1. Create Retreat
    const retreat = await retreatRepo.save({
      title: 'Event Limit Test Retreat',
      date: new Date(),
    });
    retreatId = retreat.id;

    // 2. Create 10 Winners (Pre-exist)
    // We manually insert 10 applications with 'WIN' result
    for (let i = 0; i < 10; i++) {
      const uid = `winner_${Date.now()}_${i}`;
      const user = await userRepo.save({
        userId: uid,
        password: await bcrypt.hash('password', 10),
        name: `Winner${i}`,
        rank: UserRank.MEMBER,
        phone: `010-0000-000${i}`,
        email: `${uid}@test.com`,
        group: 'WinnerGroup',
      });

      await appRepo.save({
        user: user,
        retreat: retreat,
        idn: `100${i}`,
        surveyData: {},
        feePaid: true,
        checkedInAt: new Date(), // Checked in
        eventResult: EventResult.WIN, // ALREADY WON
        eventParticipatedAt: new Date(),
      });
    }

    // 3. Create 1 Target User (The 11th participant)
    targetUserIdStr = `loser_${Date.now()}`;
    const targetUser = await userRepo.save({
      userId: targetUserIdStr,
      password: await bcrypt.hash('password', 10),
      name: 'TargetUser',
      rank: UserRank.MEMBER,
      phone: '010-9999-9999',
      email: `${targetUserIdStr}@test.com`,
      group: 'TargetGroup',
    });
    // IMPORTANT: Include userId in payload as per previous fix
    targetUserToken = jwtService.sign({ id: targetUser.id, userId: targetUser.userId, rank: targetUser.rank });

    await appRepo.save({
      user: targetUser,
      retreat: retreat,
      idn: '9999',
      surveyData: {},
      feePaid: true,
      checkedInAt: new Date(), // Checked in
      eventResult: null, // Not played yet
      eventParticipatedAt: null,
    });
  }

  it('Verification: Checks that there are already 10 winners', async () => {
     const count = await dataSource.getRepository(Application).count({
         where: { retreatId, eventResult: EventResult.WIN }
     });
     console.log(`[Test] Current Winners in DB: ${count}`);
     expect(count).toBeGreaterThanOrEqual(10);
  });

  it('POST /application/event - Should result in LOSE because limit is reached', async () => {
    // Attempt to play event
    const response = await request(app.getHttpServer())
      .post('/application/event')
      .set('Authorization', `Bearer ${targetUserToken}`)
      .send({ retreatId })
      .expect(201); // Created response

    console.log('[Test] Response:', response.body);

    expect(response.body.success).toBe(true);
    // MUST BE LOSE
    expect(response.body.data.eventResult).toBe(EventResult.LOSE);
  });
});
