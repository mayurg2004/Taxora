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

describe('Dashboard Stats API (/api/dashboard/stats)', () => {
  test('should return accurate metrics with zero assignments', async () => {
    const response = await request(app)
      .get('/api/dashboard/stats')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(0);
    expect(response.body.pending).toBe(0);
    expect(response.body.completed).toBe(0);
    expect(response.body.overdue).toBe(0);
    expect(response.body.completionPercentage).toBe(0);
    expect(response.body.upcomingDeadlines).toEqual([]);
    expect(response.body.recentAssignments).toEqual([]);
  });

  test('should calculate real metrics: total, pending, completed, overdue, and percentage', async () => {
    const now = Date.now();
    const futureDate = new Date(now + 86400000); // +1 day
    const pastDate = new Date(now - 86400000); // -1 day

    await Assignment.create([
      // 1. Pending & Upcoming
      {
        title: 'Task 1 (Pending)',
        subject: 'Web Tech',
        dueDate: futureDate,
        status: 'Pending',
      },
      // 2. In Progress & Upcoming
      {
        title: 'Task 2 (In Progress)',
        subject: 'DSA',
        dueDate: futureDate,
        status: 'In Progress',
      },
      // 3. Completed (Past due date, but completed so NOT overdue!)
      {
        title: 'Task 3 (Completed)',
        subject: 'DBMS',
        dueDate: pastDate,
        status: 'Completed',
      },
      // 4. Overdue (Past due date AND status is Pending)
      {
        title: 'Task 4 (Overdue)',
        subject: 'Networks',
        dueDate: pastDate,
        status: 'Pending',
      },
    ]);

    const response = await request(app)
      .get('/api/dashboard/stats')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(4);
    expect(response.body.pending).toBe(2);
    expect(response.body.inProgress).toBe(1);
    expect(response.body.completed).toBe(1);
    expect(response.body.overdue).toBe(1);
    // Completion percentage: 1 / 4 * 100 = 25%
    expect(response.body.completionPercentage).toBe(25);
    expect(response.body.upcomingDeadlines.length).toBe(2);
    expect(response.body.recentAssignments.length).toBe(4);
  });
});
