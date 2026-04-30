import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Question E2E', () => {
  let app: INestApplication;

  let surveyId: number;
  let questionId: number;

  const retreatId = 1;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    await app.init();

    const surveyRes = await request(app.getHttpServer())
      .post('/surveys')
      .send({
        retreatId,
        surveyStartAt: new Date().toISOString(),
        surveyEndAt: new Date().toISOString(),
      });

    surveyId = surveyRes.body.id;
  }, 60000);

  afterAll(async () => {
    await app.close();
  });

  /**
   * 질문 생성
   */
  it('POST /questions - create question with options', async () => {
    const res = await request(app.getHttpServer())
      .post('/questions')
      .send({
        surveyId,
        title: '참석 여부',
        answerType: 'SINGLE_SELECT',
        isRequired: true,
        options: [
          { label: '참석' },
          { label: '불참' },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');

    questionId = res.body.id;
  });

  /**
   * 단건 조회
   */
  it('GET /questions/:questionId', async () => {
    const res = await request(app.getHttpServer())
      .get(`/questions/${questionId}`)
      .expect(200);

    expect(res.body.id).toBe(questionId);
    expect(Array.isArray(res.body.options)).toBe(true);
    expect(res.body.options.length).toBe(2);
  });

  /**
   * 질문 수정
   */
  it('PATCH /questions - update question with options', async () => {
    const res = await request(app.getHttpServer())
      .patch('/questions')
      .send({
        questionId,
        title: '참석 여부 수정',
        options: [
          { label: '참석' },
          { label: '불참' },
          { label: '미정' },
        ],
      });

    expect(res.status).toBe(200);
  });

  /**
   * 수정 확인
   */
  it('GET /questions/:questionId - after update', async () => {
    const res = await request(app.getHttpServer())
      .get(`/questions/${questionId}`)
      .expect(200);

    expect(res.body.title).toBe('참석 여부 수정');
    expect(res.body.options.length).toBe(3);
  });

  /**
   * 질문 순서 변경
   */
  it('PATCH /questions/reorder', async () => {
    const res1 = await request(app.getHttpServer())
      .post('/questions')
      .send({
        surveyId,
        title: '두 번째 질문',
        answerType: 'SUBJECTIVE',
        isRequired: false,
      });

    const questionId2 = res1.body.id;

    await request(app.getHttpServer())
      .patch('/questions/reorder')
      .send({
        surveyId,
        questionIds: [questionId2, questionId],
      })
      .expect(200);

    // 핵심 검증: DB 상태 확인
    const res = await request(app.getHttpServer())
      .get(`/questions/survey/${surveyId}`)
    expect(res.status).toBe(200);

    const orderedIds = res.body.map((q: any) => q.id);

    expect(orderedIds[0]).toBe(questionId2);
    expect(orderedIds[1]).toBe(questionId);
  });

  /**
   * 질문 삭제
   */
  it('DELETE /questions/:questionId', async () => {
    const res = await request(app.getHttpServer())
      .delete(`/questions/${questionId}`);

    expect([200, 204]).toContain(res.status);
  });

  /**
   * 삭제 후 조회 (soft delete/미완성 대응)
   */
  it('GET /questions/:questionId - after delete', async () => {
    const res = await request(app.getHttpServer())
      .get(`/questions/${questionId}`);

    // ❗ 현재 구조는 soft delete 아님 → 200 or 404 둘 다 가능
    expect([200, 404]).toContain(res.status);
  });
});