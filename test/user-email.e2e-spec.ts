import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { createClient, RedisClientType } from 'redis';

describe('User Email Update (e2e)', () => {
  jest.setTimeout(60000);
  let app: INestApplication<App>;
  let redis: RedisClientType;
  let accessToken: string;

  // 기존 테스트 유저 (이메일 없는 유저로 가정)
  const testUserId = 'profitia';
  const testPassword = 'kalpas2626';
  const newEmail = `update_email_${Date.now()}@example.com`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v2');
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    redis = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });
    await redis.connect();
  });

  afterAll(async () => {
    await redis.disconnect();
    await app.close();
  });

  describe('Email Registration Flow for Existing User', () => {
    let verificationToken: string;

    it('1. 로그인하여 액세스 토큰 획득', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v2/auth/login')
        .send({ userId: testUserId, password: testPassword })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.access_token).toBeDefined();

      accessToken = response.body.data.access_token;
    });

    it('2. 이메일 인증 코드 발송 요청 (type=UPDATE)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v2/auth/email/${newEmail}?type=UPDATE`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Email verification code sent');
    });

    it('3. Redis에서 인증 코드 조회', async () => {
      const redisKey = `email_verification:${newEmail}`;
      const code = await redis.get(redisKey);

      expect(code).toBeDefined();
      expect(code).toHaveLength(6);

      (global as any).emailUpdateCode = code;
    });

    it('4. 이메일 인증 코드 확인 및 토큰 발급', async () => {
      const code = (global as any).emailUpdateCode;

      const response = await request(app.getHttpServer())
        .post('/api/v2/auth/email/verify')
        .send({ email: newEmail, code })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.verificationToken).toBeDefined();

      verificationToken = response.body.data.verificationToken;
    });

    it('5. 이메일 등록/변경 API 호출', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/v2/users/me/email')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          email: newEmail,
          verificationToken: verificationToken,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(newEmail);
      expect(response.body.data.emailVerifiedAt).toBeDefined();
    });

    it('6. 내 정보 조회하여 이메일 확인', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v2/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(newEmail);
    });

    it('7. 잘못된 토큰으로 이메일 변경 시도 - 실패', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/v2/users/me/email')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          email: 'another@example.com',
          verificationToken: 'invalid_token',
        })
        .expect(400);

      expect(response.body.statusCode).toBe(400);
    });

    it('8. 토큰과 이메일 불일치 시 - 실패', async () => {
      // 다른 이메일로 인증 코드 발송
      const anotherEmail = `another_${Date.now()}@example.com`;
      await request(app.getHttpServer())
        .get(`/api/v2/auth/email/${anotherEmail}?type=UPDATE`)
        .expect(200);

      const redisKey = `email_verification:${anotherEmail}`;
      const code = await redis.get(redisKey);

      // 인증 토큰 발급
      const verifyResponse = await request(app.getHttpServer())
        .post('/api/v2/auth/email/verify')
        .send({ email: anotherEmail, code })
        .expect(201);

      const anotherToken = verifyResponse.body.data.verificationToken;

      // 다른 이메일의 토큰으로 변경 시도 (불일치)
      const response = await request(app.getHttpServer())
        .patch('/api/v2/users/me/email')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          email: 'mismatch@example.com', // 토큰과 다른 이메일
          verificationToken: anotherToken,
        })
        .expect(400);

      expect(response.body.statusCode).toBe(400);
    });
  });
});
