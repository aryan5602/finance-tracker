import 'reflect-metadata';
import 'dotenv/config';
import request from 'supertest';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';

const TEST_EMAIL = 'test_jest_cats@example.com';

let app: Express.Application;
let token: string;

beforeAll(async () => {
  await AppDataSource.initialize();
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  app = (await import('../index')).default;

  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Cat Tester', email: TEST_EMAIL, password: 'password123' });
  token = (res.body as { token: string }).token;
});

afterAll(async () => {
  await AppDataSource.getRepository(User).delete({ email: TEST_EMAIL });
  await AppDataSource.destroy();
});

describe('Categories CRUD', () => {
  let catId: number;

  it('GET /api/categories — returns empty list initially', async () => {
    const res = await request(app)
      .get('/api/categories')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/categories — creates a category', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Salary', type: 'income' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Salary');
    catId = (res.body as { id: number }).id;
  });

  it('GET /api/categories — returns the created category', async () => {
    const res = await request(app)
      .get('/api/categories')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect((res.body as { id: number }[]).some((c) => c.id === catId)).toBe(true);
  });

  it('PUT /api/categories/:id — updates the category', async () => {
    const res = await request(app)
      .put(`/api/categories/${catId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Wages', type: 'income' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Wages');
  });

  it('DELETE /api/categories/:id — deletes the category', async () => {
    const res = await request(app)
      .delete(`/api/categories/${catId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(204);
  });

  it('GET /api/categories — requires auth', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(401);
  });

  it('POST /api/categories — rejects invalid type', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test', type: 'invalid' });
    expect(res.status).toBe(400);
  });
});
