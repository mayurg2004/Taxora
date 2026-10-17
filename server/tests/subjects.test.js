import request from 'supertest';
import app from '../src/app.js';
import { Subject } from '../src/models/Subject.js';
import { Assignment } from '../src/models/Assignment.js';
import { setupTestDB, teardownTestDB, clearTestDB, createTestAdmin } from './setup.js';

let authToken;

beforeAll(async () => {
  await setupTestDB();
});

afterAll(async () => {
  await teardownTestDB();
});

beforeEach(async () => {
  await clearTestDB();
  const adminData = await createTestAdmin();
  authToken = adminData.token;
});

describe('Subjects API (/api/subjects)', () => {
  test('should create a new subject', async () => {
    const response = await request(app)
      .post('/api/subjects')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Operating Systems',
        code: 'IT-301',
        description: 'Processes, memory management, and file systems.',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.subject.name).toBe('Operating Systems');
  });

  test('should reject duplicate subject creation', async () => {
    await Subject.create({ name: 'Web Technologies', code: 'IT-401' });

    const response = await request(app)
      .post('/api/subjects')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Web Technologies' });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
  });

  test('should fetch subjects with computed assignment count', async () => {
    await Subject.create({ name: 'Web Technologies' });
    await Assignment.create([
      { title: 'Task 1', subject: 'Web Technologies', dueDate: new Date() },
      { title: 'Task 2', subject: 'Web Technologies', dueDate: new Date() },
    ]);

    const response = await request(app)
      .get('/api/subjects')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    const webTech = response.body.subjects.find((s) => s.name === 'Web Technologies');
    expect(webTech).toBeDefined();
    expect(webTech.assignmentCount).toBe(2);
  });

  test('should prevent deletion of a subject that has associated assignments', async () => {
    const subject = await Subject.create({ name: 'Database Systems' });
    await Assignment.create({
      title: 'Lab 1',
      subject: 'Database Systems',
      dueDate: new Date(),
    });

    const response = await request(app)
      .delete(`/api/subjects/${subject._id}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Cannot delete');

    // Confirm subject is still in database
    const stillExists = await Subject.findById(subject._id);
    expect(stillExists).not.toBeNull();
  });

  test('should allow deletion of a subject with zero assignments', async () => {
    const subject = await Subject.create({ name: 'Unused Subject' });

    const response = await request(app)
      .delete(`/api/subjects/${subject._id}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);

    const check = await Subject.findById(subject._id);
    expect(check).toBeNull();
  });
});
