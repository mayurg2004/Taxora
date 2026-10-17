import request from 'supertest';
import app from '../src/app.js';
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

describe('Assignments API (/api/assignments)', () => {
  test('should create a new assignment with valid input', async () => {
    const newAssignment = {
      title: 'Lab 1 — JavaScript Promises',
      subject: 'Web Technologies',
      description: 'Understanding asynchronous programming with promises and async/await.',
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      priority: 'High',
      status: 'Pending',
    };

    const response = await request(app)
      .post('/api/assignments')
      .set('Authorization', `Bearer ${authToken}`)
      .send(newAssignment);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.assignment.title).toBe(newAssignment.title);
    expect(response.body.assignment._id).toBeDefined();
  });

  test('should fail when creating an assignment without required fields', async () => {
    const invalidAssignment = {
      description: 'Missing title and due date',
    };

    const response = await request(app)
      .post('/api/assignments')
      .set('Authorization', `Bearer ${authToken}`)
      .send(invalidAssignment);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test('should reject creation without auth token', async () => {
    const response = await request(app)
      .post('/api/assignments')
      .send({
        title: 'Unauthorized Test',
        subject: 'Web Technologies',
        dueDate: new Date().toISOString(),
      });

    expect(response.status).toBe(401);
  });

  test('should fetch list of all assignments', async () => {
    await Assignment.create([
      {
        title: 'Task A',
        subject: 'Math',
        dueDate: new Date(),
        priority: 'Low',
        status: 'Pending',
      },
      {
        title: 'Task B',
        subject: 'Science',
        dueDate: new Date(),
        priority: 'High',
        status: 'Completed',
      },
    ]);

    const response = await request(app)
      .get('/api/assignments')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.assignments.length).toBe(2);
  });

  test('should retrieve an individual assignment by ID', async () => {
    const created = await Assignment.create({
      title: 'Individual Assignment',
      subject: 'Database Systems',
      dueDate: new Date(),
      priority: 'Medium',
      status: 'Pending',
    });

    const response = await request(app)
      .get(`/api/assignments/${created._id}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.assignment.title).toBe('Individual Assignment');
  });

  test('should return 400 for an invalid assignment ID format', async () => {
    const response = await request(app)
      .get('/api/assignments/invalid-id-format')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(400);
  });

  test('should update an existing assignment', async () => {
    const created = await Assignment.create({
      title: 'Original Title',
      subject: 'Networks',
      dueDate: new Date(),
      priority: 'Low',
      status: 'Pending',
    });

    const response = await request(app)
      .put(`/api/assignments/${created._id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Updated Title',
        priority: 'High',
      });

    expect(response.status).toBe(200);
    expect(response.body.assignment.title).toBe('Updated Title');
    expect(response.body.assignment.priority).toBe('High');
  });

  test('should update only status via PATCH /api/assignments/:id/status', async () => {
    const created = await Assignment.create({
      title: 'Status Update Task',
      subject: 'Web Technologies',
      dueDate: new Date(),
      status: 'Pending',
    });

    const response = await request(app)
      .patch(`/api/assignments/${created._id}/status`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'Completed' });

    expect(response.status).toBe(200);
    expect(response.body.assignment.status).toBe('Completed');
  });

  test('should delete an assignment', async () => {
    const created = await Assignment.create({
      title: 'Task To Delete',
      subject: 'Web Technologies',
      dueDate: new Date(),
    });

    const deleteRes = await request(app)
      .delete(`/api/assignments/${created._id}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(deleteRes.status).toBe(200);

    const checkRes = await request(app)
      .get(`/api/assignments/${created._id}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(checkRes.status).toBe(404);
  });
});
