// ============================================================================
// IDEMPOTENT DATABASE SEED SCRIPT
// Safely seeds development administrator, academic subjects, and sample coursework
// Does not duplicate existing records!
// ============================================================================

import dotenv from 'dotenv';
dotenv.config();

import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Subject } from '../models/Subject.js';
import { Assignment } from '../models/Assignment.js';

export async function seedDatabase() {
  console.log('[Taskora Seed] Initializing database seeding...');

  // 1. Seed Administrator
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@taskora.local').toLowerCase().trim();
  const adminName = process.env.ADMIN_NAME || 'Admin User';
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminTaskora123!';

  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    });
    console.log(`[Taskora Seed] Created default administrator: ${adminEmail}`);
  } else {
    console.log(`[Taskora Seed] Administrator ${adminEmail} already exists. Skipping creation.`);
  }

  // 2. Seed Academic Subjects
  const sampleSubjects = [
    {
      name: 'Web Technologies',
      code: 'IT-401',
      description: 'Full-stack web architecture, React, Node.js, REST APIs, and HTTP protocols.',
    },
    {
      name: 'Data Structures & Algorithms',
      code: 'IT-402',
      description: 'Trees, graphs, dynamic programming, sorting, and algorithmic complexity.',
    },
    {
      name: 'Database Management Systems',
      code: 'IT-403',
      description: 'Relational design, normalization, ACID properties, NoSQL, and indexing.',
    },
    {
      name: 'Computer Networks',
      code: 'IT-404',
      description: 'OSI 7 layers, TCP/IP socket programming, routing protocols, and subnetting.',
    },
    {
      name: 'Software Engineering',
      code: 'IT-405',
      description: 'Agile methodologies, UML modeling, testing strategies, and CI/CD pipelines.',
    },
  ];

  for (const subj of sampleSubjects) {
    const exists = await Subject.findOne({ name: subj.name });
    if (!exists) {
      await Subject.create(subj);
      console.log(`[Taskora Seed] Added subject: ${subj.name}`);
    }
  }

  // 3. Seed Realistic Academic Assignments
  const now = new Date();
  
  // Dynamic dates relative to today
  const inThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const inFiveDays = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
  const inTenDays = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);

  const sampleAssignments = [
    {
      title: 'Lab Experiment 4 — REST API Integration',
      subject: 'Web Technologies',
      description: 'Implement Express.js CRUD controllers with Mongoose models and test endpoints using Postman.',
      dueDate: inThreeDays,
      priority: 'High',
      status: 'In Progress',
    },
    {
      title: 'Binary Search Tree & AVL Balancing',
      subject: 'Data Structures & Algorithms',
      description: 'Construct a self-balancing AVL tree in C++/TypeScript with rotation implementations.',
      dueDate: inFiveDays,
      priority: 'Medium',
      status: 'Pending',
    },
    {
      title: 'SQL Schema Normalization (3NF & BCNF)',
      subject: 'Database Management Systems',
      description: 'Analyze an unnormalized student registry table and decompose it into BCNF relations.',
      dueDate: tomorrow,
      priority: 'High',
      status: 'Pending',
    },
    {
      title: 'Socket Programming Lab Practical',
      subject: 'Computer Networks',
      description: 'Develop a multi-threaded TCP client-server echo application with packet analysis in Wireshark.',
      dueDate: inTenDays,
      priority: 'Low',
      status: 'Pending',
    },
    {
      title: 'Agile Sprint Planning & User Stories',
      subject: 'Software Engineering',
      description: 'Draft user stories, acceptance criteria, and estimation story points for Taskora Sprint 1.',
      dueDate: twoDaysAgo,
      priority: 'Medium',
      status: 'Completed',
    },
    {
      title: 'CSS Flexbox & Responsive Layout Assignment',
      subject: 'Web Technologies',
      description: 'Build a mobile-responsive dashboard layout strictly using Vanilla CSS media queries.',
      dueDate: fourDaysAgo,
      priority: 'High',
      status: 'Pending', // This will be overdue because dueDate < now and status !== Completed
    },
  ];

  for (const assign of sampleAssignments) {
    const exists = await Assignment.findOne({ title: assign.title });
    if (!exists) {
      await Assignment.create(assign);
      console.log(`[Taskora Seed] Added assignment: ${assign.title}`);
    }
  }

  console.log('[Taskora Seed] Database seeding completed successfully!');
}

// Allow direct CLI invocation: `node src/utils/seedData.js`
if (process.argv[1] && process.argv[1].endsWith('seedData.js')) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      console.error('[Taskora Seed Error]:', err);
      process.exit(1);
    }
  })();
}
