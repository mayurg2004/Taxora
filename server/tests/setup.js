// ============================================================================
// TEST ENVIRONMENT SETUP
// Boots an isolated MongoDB instance and seeds a test administrator
// ============================================================================

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import { User } from '../src/models/User.js';
import { Subject } from '../src/models/Subject.js';
import { Assignment } from '../src/models/Assignment.js';

let mongoServer;

export async function setupTestDB() {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}

export async function teardownTestDB() {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
}

export async function clearTestDB() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}

export async function createTestAdmin() {
  const user = await User.create({
    name: 'Test Administrator',
    email: 'admin@test.local',
    password: 'Password123!',
    role: 'admin',
  });

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET || 'taskora_development_jwt_secret_key_change_in_production_123456',
    { expiresIn: '1h' }
  );

  return { user, token };
}
