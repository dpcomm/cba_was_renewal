import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { createClient, RedisClientType } from 'redis';

describe('Auth Registration Flow (e2e)', () => {
  let app: INestApplication<App>;
  let redis: RedisClientType;
  
  const testEmail = `test_${Date.now()}@example.com`;
  const testUserId = `testuser_${Date.now()}`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
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

  describe('Registration with Email Verification', () => {
    let verificationToken: string;

    it('1. 이메일 인증 코드 발송 요청', async () => {
      const response = await request(app.getHttpServer())
        .get(`/auth/email/${testEmail}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Email verification code sent');
    });

    it('2. Redis에서 인증 코드 조회 (테스트용)', async () => {
      const redisKey = `email_verification:${testEmail}`;
      const code = await redis.get(redisKey);
      
      expect(code).toBeDefined();
      expect(code).toHaveLength(6); // 6자리 코드
      
      // 다음 테스트에서 사용하기 위해 전역 변수에 저장
      (global as any).testVerificationCode = code;
    });

    it('3. 이메일 인증 코드 확인 및 토큰 발급', async () => {
      const code = (global as any).testVerificationCode;
      
      const response = await request(app.getHttpServer())
        .post('/auth/email/verify')
        .send({ email: testEmail, code })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.verificationToken).toBeDefined();
      
      verificationToken = response.body.data.verificationToken;
    });

    it('4. 회원가입 완료', async () => {
      const registerData = {
        userId: testUserId,
        password: 'Test1234!',
        name: '테스트유저',
        group: '테스트그룹',
        phone: '010-1234-5678',
        email: testEmail,
        verificationToken: verificationToken,
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.userId).toBe(testUserId);
      expect(response.body.data.email).toBe(testEmail);
      // emailVerifiedAt이 설정되었는지 확인
      expect(response.body.data.emailVerifiedAt).toBeDefined();
    }, 30000);

    it('5. 중복 회원가입 시도 시 실패', async () => {
      // 새로운 이메일 인증 처리
      const newEmail = `test_dup_${Date.now()}@example.com`;
      await request(app.getHttpServer()).get(`/auth/email/${newEmail}`);
      const code = await redis.get(`email_verification:${newEmail}`);
      
      const verifyResponse = await request(app.getHttpServer())
        .post('/auth/email/verify')
        .send({ email: newEmail, code });
      
      const newToken = verifyResponse.body.data.verificationToken;

      // 같은 userId로 다시 회원가입 시도
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          userId: testUserId, // 이미 존재하는 userId
          password: 'Test1234!',
          name: '중복유저',
          group: '테스트그룹',
          phone: '010-9999-9999',
          email: newEmail,
          verificationToken: newToken,
        })
        .expect(400);

      expect(response.body.message).toContain('already exists');
    }, 30000);

    it('6. 잘못된 인증 토큰으로 회원가입 시도 시 실패', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          userId: `another_${Date.now()}`,
          password: 'Test1234!',
          name: '실패유저',
          group: '테스트그룹',
          phone: '010-8888-8888',
          email: 'fake@example.com',
          verificationToken: 'invalid_token_here',
        })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });
  });
});
