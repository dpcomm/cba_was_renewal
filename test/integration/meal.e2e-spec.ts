import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';

import { AppModule } from '../../src/app.module';

describe('Meal E2E', () => {
  let app: INestApplication;

  let mealId: number;
  const retreatId = 1;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
    }));

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ------------------------
  // CREATE
  // ------------------------
  it('POST /meals - should create meal', async () => {
    const res = await request(app.getHttpServer())
      .post('/admin/meals')
      .send({
        retreatId,
        mealDay: '2026-08-21',
        mealType: 'BREAKFAST',
        mealTable: ['밥', '국'],
      })
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.mealType).toBe('BREAKFAST');

    mealId = res.body.id;
  });

  it('POST /meals - duplicate should fail', async () => {
    await request(app.getHttpServer())
      .post('/admin/meals')
      .send({
        retreatId,
        mealDay: '2026-08-21',
        mealType: 'BREAKFAST',
        mealTable: ['밥'],
      })
      .expect(409);
  });

  // ------------------------
  // LIST
  // ------------------------
  it('GET /meals - should return list', async () => {
    const res = await request(app.getHttpServer())
      .get('/admin/meals')
      .query({ retreatId })
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  // ------------------------
  // UPDATE
  // ------------------------
  it('PATCH /meals - should update meal', async () => {
    const res = await request(app.getHttpServer())
      .patch('/admin/meals')
      .send({
        id: mealId,
        mealTable: ['밥', '국', '계란'],
      })
      .expect(200);

    expect(res.body.mealTable.length).toBe(3);
  });

  // ------------------------
  // COUNT
  // ------------------------
  it('GET /meals/count - should return counts', async () => {
    const res = await request(app.getHttpServer())
      .get(`/admin/meals/count/${retreatId}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);

    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('mealDay');
      expect(res.body[0]).toHaveProperty('mealType');
      expect(res.body[0]).toHaveProperty('count');
    }
  });

  // ------------------------
  // DELETE
  // ------------------------
  it('DELETE /meals/:id - should delete meal', async () => {
    await request(app.getHttpServer())
      .delete(`/admin/meals/${mealId}`)
      .expect(200);
  });

  it('DELETE /meals/:id - should fail if not exists', async () => {
    await request(app.getHttpServer())
      .delete(`/admin/meals/${mealId}`)
      .expect(404);
  });
});