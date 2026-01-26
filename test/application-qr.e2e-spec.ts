import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { User } from '../src/modules/user/domain/entities/user.entity';
import { Retreat } from '../src/modules/retreat/domain/entities/retreat.entity';
import { Application } from '../src/modules/application/domain/entities/application.entity';
import { UserRank } from '../src/modules/user/domain/enums/user-rank.enum';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

describe('Application QR Check-in & Event (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let jwtService: JwtService;

  let adminToken: string;
  let userToken: string;
  let userId: string;
  let retreatId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    dataSource = app.get(DataSource);
    jwtService = app.get(JwtService);

    // 1. Seed Data
    await seedData();
  });

  afterAll(async () => {
    // Cleanup if necessary
    // await dataSource.dropDatabase(); // Optional: risky if using shared DB
    await app.close();
  });

  async function seedData() {
    const userRepo = dataSource.getRepository(User);
    const retreatRepo = dataSource.getRepository(Retreat);
    const appRepo = dataSource.getRepository(Application);

    // Create Admin User
    const adminId = `admin_${Date.now()}`;
    const admin = await userRepo.save({
      userId: adminId,
      password: await bcrypt.hash('password', 10),
      name: 'AdminUser',
      rank: UserRank.ADMIN, // 'A'
      phone: '010-0000-0000',
      group: 'Staff',
      email: `admin_${Date.now()}@test.com`,
    });
    adminToken = jwtService.sign({ id: admin.id, rank: admin.rank });

    // Create Normal User
    userId = `user_${Date.now()}`;
    const user = await userRepo.save({
      userId: userId,
      password: await bcrypt.hash('password', 10),
      name: 'NormalUser',
      rank: UserRank.MEMBER, // 'M'
      phone: '010-1111-1111',
      group: 'Member',
      email: `user_${Date.now()}@test.com`,
    });
    userToken = jwtService.sign({ id: user.id, rank: user.rank });

    // Create Retreat
    const retreat = await retreatRepo.save({
      title: 'Test Retreat',
      date: new Date(),
    });
    retreatId = retreat.id;

    // Create Application
    await appRepo.save({
      user: user,
      retreat: retreat,
      idn: '1234',
      surveyData: {},
      feePaid: true, // 납부 완료 상태
      checkedInAt: null,
      eventOutcome: null,
    });
  }

  describe('User Flow: Pre-Checkin', () => {
    it('GET /application/me/:retreatId - Should return application details', async () => {
      const response = await request(app.getHttpServer())
        .get(`/application/me/${retreatId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBe(userId);
      expect(response.body.data.feePaid).toBe(true);
      expect(response.body.data.checkedInAt).toBeNull();
    });

    it('POST /application/event - Should fail if not checked in', async () => {
      const response = await request(app.getHttpServer())
        .post('/application/event')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ retreatId })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User is not checked in');
    });
  });

  describe('Admin Flow: Check-in', () => {
    it('GET /application/admin/scan/:userId/:retreatId - Should return user info', async () => {
      const response = await request(app.getHttpServer())
        .get(`/application/admin/scan/${userId}/${retreatId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('NormalUser');
      expect(response.body.data.feePaid).toBe(true);
      expect(response.body.data.checkedInAt).toBeNull();
    });

    it('POST /application/admin/check-in - Should succeed', async () => {
      const response = await request(app.getHttpServer())
        .post('/application/admin/check-in')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userId, retreatId })
        .expect(201); // Created

      expect(response.body.success).toBe(true);
      expect(response.body.data.checkedInAt).toBeDefined();
    });

    it('GET /application/admin/scan... - Should show checkedInAt timestamp', async () => {
      const response = await request(app.getHttpServer())
        .get(`/application/admin/scan/${userId}/${retreatId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.checkedInAt).not.toBeNull();
    });

    it('POST /application/admin/check-in - Should fail if already checked in', async () => {
      await request(app.getHttpServer())
        .post('/application/admin/check-in')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ userId, retreatId })
        .expect(409); // Conflict
    });
  });

  describe('User Flow: Post-Checkin (Event)', () => {
    it('POST /application/event - Should succeed now', async () => {
      const response = await request(app.getHttpServer())
        .post('/application/event')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ retreatId })
        .expect(201);

      expect(response.body.success).toBe(true);
      const result = response.body.data.eventResult;
      expect(['WIN', 'LOSE']).toContain(result);
    });

    it('GET /application/me... - Should show event result', async () => {
      const response = await request(app.getHttpServer())
        .get(`/application/me/${retreatId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.data.eventResult).not.toBeNull();
    });

    it('POST /application/event - Should fail if already participated', async () => {
      await request(app.getHttpServer())
        .post('/application/event')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ retreatId })
        .expect(409); // Conflict
    });
  });

  describe('Security Check', () => {
    it('Ordinary user cannot access admin APIs', async () => {
      await request(app.getHttpServer())
        .get(`/application/admin/scan/${userId}/${retreatId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      await request(app.getHttpServer())
        .post('/application/admin/check-in')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ userId, retreatId })
        .expect(403);
    });
  });
});
