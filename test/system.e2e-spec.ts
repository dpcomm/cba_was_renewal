import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource, Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import { SystemConfig } from '../src/modules/system/domain/entities/system-config.entity';
import { Retreat } from '../src/modules/retreat/domain/entities/retreat.entity';
import { Term } from '../src/modules/term/domain/entities/term.entity';
import { User } from '../src/modules/user/domain/entities/user.entity';
import { UserGroup } from '../src/modules/user/domain/enums/user-group.enum';
import { UserRank } from '../src/modules/user/domain/enums/user-rank.enum';

describe('System Settings (E2E)', () => {
  let app: INestApplication<App>;
  let systemConfigRepository: Repository<SystemConfig>;
  let retreatRepository: Repository<Retreat>;
  let termRepository: Repository<Term>;
  let userRepository: Repository<User>;
  let originalCurrentRetreatId: number | null;
  let originalCurrentTermId: number | null;
  let retreatId: number;
  let termId: number;
  let adminUserId: number;
  let memberUserId: number;
  let adminToken: string;
  let memberToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();

    const dataSource = app.get(DataSource);
    const jwtService = app.get(JwtService);
    systemConfigRepository = dataSource.getRepository(SystemConfig);
    retreatRepository = dataSource.getRepository(Retreat);
    termRepository = dataSource.getRepository(Term);
    userRepository = dataSource.getRepository(User);

    const config = await ensureSystemConfig();
    originalCurrentRetreatId = config.currentRetreatId;
    originalCurrentTermId = config.currentTermId;

    const suffix = Date.now();
    const retreat = await retreatRepository.save({
      title: `System E2E Retreat ${suffix}`,
      location: 'System E2E Location',
      retreatStartAt: new Date('2030-01-01T00:00:00.000Z'),
      retreatEndAt: new Date('2030-01-02T00:00:00.000Z'),
    });
    retreatId = retreat.id;

    const term = await termRepository.save({
      name: `System E2E Term ${suffix}`,
      description: '',
      startDate: new Date('2030-01-01T00:00:00.000Z'),
      endDate: new Date('2030-03-01T00:00:00.000Z'),
    });
    termId = term.id;

    const admin = await userRepository.save({
      userId: `system_admin_${suffix}`,
      password: 'password',
      name: 'System Admin',
      rank: UserRank.ADMIN,
      phone: '010-0000-0000',
      email: `system_admin_${suffix}@test.com`,
      group: UserGroup.ETC,
    });
    adminUserId = admin.id;
    adminToken = jwtService.sign({
      id: admin.id,
      userId: admin.userId,
      rank: admin.rank,
    });

    const member = await userRepository.save({
      userId: `system_member_${suffix}`,
      password: 'password',
      name: 'System Member',
      rank: UserRank.MEMBER,
      phone: '010-1111-1111',
      email: `system_member_${suffix}@test.com`,
      group: UserGroup.ETC,
    });
    memberUserId = member.id;
    memberToken = jwtService.sign({
      id: member.id,
      userId: member.userId,
      rank: member.rank,
    });
  }, 60000);

  afterAll(async () => {
    if (systemConfigRepository) {
      await systemConfigRepository.update(
        { id: 1 },
        {
          currentRetreatId: originalCurrentRetreatId,
          currentTermId: originalCurrentTermId,
        },
      );
    }
    if (userRepository) {
      await userRepository.delete([adminUserId, memberUserId]);
    }
    if (retreatRepository) {
      await retreatRepository.delete(retreatId);
    }
    if (termRepository) {
      await termRepository.delete(termId);
    }
    await app?.close();
  });

  it('공용 시스템 설정을 조회한다', async () => {
    const response = await request(app.getHttpServer())
      .get('/system')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('currentRetreatId');
    expect(response.body.data).toHaveProperty('currentTermId');
  });

  it('일반 사용자는 시스템 설정을 변경할 수 없다', async () => {
    await request(app.getHttpServer())
      .put('/admin/system')
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ currentRetreatId: retreatId, currentTermId: termId })
      .expect(403);
  });

  it('관리자는 현재 수련회와 선택식 강의 시즌을 변경할 수 있다', async () => {
    const response = await request(app.getHttpServer())
      .put('/admin/system')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ currentRetreatId: retreatId, currentTermId: termId })
      .expect(200);

    expect(response.body.data.currentRetreatId).toBe(retreatId);
    expect(response.body.data.currentTermId).toBe(termId);
    expect(response.body.data.currentRetreat.id).toBe(retreatId);
    expect(response.body.data.currentTerm.id).toBe(termId);
  });

  it('관리자는 현재 수련회와 시즌 선택 옵션을 조회할 수 있다', async () => {
    const response = await request(app.getHttpServer())
      .get('/admin/system/options')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.data.retreats).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: retreatId })]),
    );
    expect(response.body.data.terms).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: termId })]),
    );
  });

  it('존재하지 않는 현재 수련회는 선택할 수 없다', async () => {
    await request(app.getHttpServer())
      .put('/admin/system')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ currentRetreatId: 2147483647 })
      .expect(400);
  });

  async function ensureSystemConfig(): Promise<SystemConfig> {
    const existing = await systemConfigRepository.findOneBy({ id: 1 });
    if (existing) {
      return existing;
    }

    return systemConfigRepository.save({
      id: 1,
      appName: 'CBA Connect',
      versionName: '1.0.0',
      versionCode: 1,
      minimumVersionCode: 1,
      privacyPolicyUrl: null,
      privacyPolicyVersion: 1,
      privacyPolicyUpdatedAt: null,
      maintenanceMode: false,
      maintenanceMessage: null,
      currentTermId: null,
      currentRetreatId: null,
    });
  }
});
