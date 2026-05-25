import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { User } from '../src/modules/user/domain/entities/user.entity';
import { Retreat } from '../src/modules/retreat/domain/entities/retreat.entity';
import { Application } from '../src/modules/application/domain/entities/application.entity';
import {
  ApplicationStatus,
  PaymentStatus,
} from '../src/modules/application/domain/enum/application.enum';
import { UserGroup } from '../src/modules/user/domain/enums/user-group.enum';
import { UserRank } from '../src/modules/user/domain/enums/user-rank.enum';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

describe('Admin Application List (E2E)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let jwtService: JwtService;

  let adminToken: string;
  let memberToken: string;
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
      title: 'Admin List Test Retreat',
      date: new Date(),
    });
    retreatId = retreat.id;

    // 2. Create Admin
    const adminUser = await userRepo.save({
      userId: `admin_list_${Date.now()}`,
      password: await bcrypt.hash('password', 10),
      name: 'AdminUser',
      rank: UserRank.ADMIN,
      phone: '010-0000-0000',
      email: `admin_list_${Date.now()}@test.com`,
      group: UserGroup.ETC,
    });
    adminToken = jwtService.sign({
      id: adminUser.id,
      userId: adminUser.userId,
      rank: adminUser.rank,
    });

    // 3. Create Normal Member
    const memberUser = await userRepo.save({
      userId: `member_list_${Date.now()}`,
      password: await bcrypt.hash('password', 10),
      name: 'MemberUser',
      rank: UserRank.MEMBER,
      phone: '010-1111-1111',
      email: `member_list_${Date.now()}@test.com`,
      group: UserGroup.ETC,
    });
    memberToken = jwtService.sign({
      id: memberUser.id,
      userId: memberUser.userId,
      rank: memberUser.rank,
    });

    // 4. Create Applications with various states

    // User A: Paid, Checked In
    const userA = await userRepo.save({
      userId: `userA_${Date.now()}`,
      password: 'pw',
      name: 'Alice',
      rank: 'M',
      phone: '010-1234-5678',
      email: `userA_${Date.now()}@test.com`,
      group: UserGroup.KWON_SOON_YOUNG_AND_LIM_KANG_MI_M,
    });
    await appRepo.save({
      user: userA,
      retreat,
      idn: 'A001',
      surveyData: {},
      paymentStatus: PaymentStatus.PAID,
      status: ApplicationStatus.CHECKED_IN,
      checkedInAt: new Date(),
    });

    // User B: Paid, Not Checked In
    const userB = await userRepo.save({
      userId: `userB_${Date.now()}`,
      password: 'pw',
      name: 'Bob',
      rank: 'M',
      phone: '010-2345-6789',
      email: `userB_${Date.now()}@test.com`,
      group: UserGroup.NOH_SI_EUN_AND_YOON_SEUNG_O_M,
    });
    await appRepo.save({
      user: userB,
      retreat,
      idn: 'B001',
      surveyData: {},
      paymentStatus: PaymentStatus.PAID,
      status: ApplicationStatus.SUBMITTED,
      checkedInAt: null,
    });

    // User C: Not Paid, Not Checked In
    const userC = await userRepo.save({
      userId: `userC_${Date.now()}`,
      password: 'pw',
      name: 'Charlie',
      rank: 'M',
      phone: '010-3456-7890',
      email: `userC_${Date.now()}@test.com`,
      group: UserGroup.BRIDGE,
    });
    await appRepo.save({
      user: userC,
      retreat,
      idn: 'C001',
      surveyData: {},
      paymentStatus: PaymentStatus.PENDING,
      status: ApplicationStatus.SUBMITTED,
      checkedInAt: null,
    });
  }

  it('Should fail if not admin', async () => {
    await request(app.getHttpServer())
      .get('/admin/applications')
      .query({ retreatId })
      .set('Authorization', `Bearer ${memberToken}`)
      .expect(403);
  });

  it('Should return all applications (default)', async () => {
    const response = await request(app.getHttpServer())
      .get('/admin/applications')
      .query({ retreatId })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.success).toBe(true);
    const data = response.body.data.items;
    expect(response.body.data.meta.page).toBe(1);
    expect(response.body.data.meta.limit).toBe(20);
    expect(response.body.data.meta.total).toBeGreaterThanOrEqual(3);
    expect(data.length).toBeGreaterThanOrEqual(3);

    const names = data.map((d: any) => d.name);
    expect(names).toContain('Alice');
    expect(names).toContain('Bob');
    expect(names).toContain('Charlie');
  });

  it('Should filter by search (Name)', async () => {
    const response = await request(app.getHttpServer())
      .get('/admin/applications')
      .query({ retreatId, search: 'Alice' })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const data = response.body.data.items;
    expect(data.length).toBe(1);
    expect(data[0].name).toBe('Alice');
  });

  it('Should filter by search (Group)', async () => {
    const response = await request(app.getHttpServer())
      .get('/admin/applications')
      .query({ retreatId, search: UserGroup.BRIDGE })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const data = response.body.data.items;
    const names = data.map((d: any) => d.name);
    expect(names).toContain('Charlie');
  });

  it('Should filter by applicationStatus', async () => {
    const response = await request(app.getHttpServer())
      .get('/admin/applications')
      .query({ retreatId, applicationStatus: ApplicationStatus.SUBMITTED })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const data = response.body.data.items;
    // Alice is checked in, so she should NOT be here.
    // Bob and Charlie are NOT checked in.
    const names = data.map((d: any) => d.name);
    expect(names).not.toContain('Alice');
    expect(names).toContain('Bob');
    expect(names).toContain('Charlie');
  });

  it('Should filter by group', async () => {
    const response = await request(app.getHttpServer())
      .get('/admin/applications')
      .query({ retreatId, group: UserGroup.BRIDGE })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const data = response.body.data.items;
    const names = data.map((d: any) => d.name);
    expect(names).toContain('Charlie');
    expect(names).not.toContain('Alice');
    expect(names).not.toContain('Bob');
  });

  it('Should paginate applications', async () => {
    const response = await request(app.getHttpServer())
      .get('/admin/applications')
      .query({ retreatId, page: 2, limit: 2 })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const data = response.body.data;
    expect(data.items.length).toBeLessThanOrEqual(2);
    expect(data.meta).toEqual(
      expect.objectContaining({
        page: 2,
        limit: 2,
      }),
    );
    expect(data.meta.total).toBeGreaterThanOrEqual(3);
    expect(data.meta.totalPages).toBeGreaterThanOrEqual(2);
    expect(data.meta.hasPrev).toBe(true);
  });

  it('Should filter by paymentStatus', async () => {
    const response = await request(app.getHttpServer())
      .get('/admin/applications')
      .query({ retreatId, paymentStatus: PaymentStatus.PENDING })
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const data = response.body.data.items;
    const names = data.map((d: any) => d.name);
    expect(names).toContain('Charlie');
    expect(names).not.toContain('Alice'); // Paid
    expect(names).not.toContain('Bob'); // Paid
  });
});
