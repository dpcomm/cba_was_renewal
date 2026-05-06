import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Survey E2E', () => {
  let app: INestApplication;
  let surveyId: number;

  const retreatId = 1;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  }, 60000);

  afterAll(async () => {
    await app.close();
  });

  /**
   * 설문 생성
   */
  it('POST /surveys - create survey', async () => {
    const res = await request(app.getHttpServer())
      .post('/surveys')
      .send({
        retreatId: retreatId,
        surveyStartAt: new Date().toISOString(),
        surveyEndAt: new Date().toISOString(),
      });

    // 디버깅용 (문제 생기면 바로 확인 가능)
    // console.log(res.body);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');

    surveyId = res.body.id;
  });

  /**
   * 수련회 기준 설문 조회
   */
  it('GET /surveys/retreat/:retreatId', async () => {
    const res = await request(app.getHttpServer())
      .get(`/surveys/retreat/${retreatId}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);

    const ids = res.body.map((s: any) => s.id);
    expect(ids).toContain(surveyId);
  });

  /**
   * 설문 미리보기
   */
  it('GET /surveys/:surveyId/preview', async () => {
    const res = await request(app.getHttpServer())
      .get(`/surveys/${surveyId}/preview`)
      .expect(200);

    expect(res.body).toHaveProperty('questions');
    expect(Array.isArray(res.body.questions)).toBe(true);
  });

  /**
   * 설문 삭제
   */
  it('DELETE /surveys/:surveyId', async () => {
    await request(app.getHttpServer())
      .delete(`/surveys/${surveyId}`)
      .expect(200);
  });
});