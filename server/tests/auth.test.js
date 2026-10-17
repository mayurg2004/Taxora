import request from 'supertest';
import app from '../src/app.js';
import { setupTestDB, teardownTestDB, clearTestDB, createTestAdmin } from './setup.js';

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await clearTestDB();
});

describe('Authentication API (/api/auth)', () => {
  test('should authenticate administrator with valid credentials', async () => {
    await createTestAdmin();

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.local',
        password: 'Password123!',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();
    expect(response.body.user.email).toBe('admin@test.local');
    expect(response.body.user.password).toBeUndefined(); // Never return password hash!
  });

  test('should reject login with incorrect password', async () => {
    await createTestAdmin();

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.local',
        password: 'WrongPassword!',
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  test('should reject login when fields are missing', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@test.local',
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test('should return current user profile on GET /api/auth/me with valid token', async () => {
    const { token, user } = await createTestAdmin();

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.user._id).toBe(user._id.toString());
  });

  test('should reject GET /api/auth/me when token is missing', async () => {
    const response = await request(app).get('/api/auth/me');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
