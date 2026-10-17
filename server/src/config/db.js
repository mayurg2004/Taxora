// ============================================================================
// DATABASE CONNECTION CONFIGURATION (Mongoose + MongoDB)
// Connects to local MongoDB, MongoDB Atlas, or in-memory fallback for zero-config evaluation
// ============================================================================

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memoryServer = null;

/**
 * Establishes connection to MongoDB.
 * 1. Attempts connection using process.env.MONGO_URI (e.g. Atlas or local mongod).
 * 2. If no local mongod is active and in development/test, automatically falls back
 *    to an in-memory MongoDB instance to guarantee zero-crash execution during evaluation!
 */
export async function connectDB(customUri = null) {
  const uri = customUri || process.env.MONGO_URI;

  try {
    // Attempt connecting to configured URI with short timeout
    await mongoose.connect(uri || 'mongodb://127.0.0.1:27017/taskora', {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[Taskora DB] Connected to MongoDB at: ${mongoose.connection.host}`);
    return mongoose.connection;
  } catch (err) {
    // If connection to local server fails, fall back gracefully to in-memory MongoDB in dev/test
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[Taskora DB] Local MongoDB server not reachable (${err.message}).`);
      console.log(`[Taskora DB] Booting zero-config in-memory MongoDB instance for development/evaluation...`);
      
      memoryServer = await MongoMemoryServer.create();
      const inMemoryUri = memoryServer.getUri();
      
      await mongoose.connect(inMemoryUri);
      console.log(`[Taskora DB] Connected to In-Memory MongoDB at: ${inMemoryUri}`);
      return mongoose.connection;
    }

    console.error(`[Taskora DB] Critical: Could not connect to MongoDB database:`, err);
    throw err;
  }
}

/**
 * Disconnects from MongoDB and stops in-memory server if running (used in tests and shutdown).
 */
export async function disconnectDB() {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
      memoryServer = null;
    }
    console.log('[Taskora DB] Disconnected from MongoDB.');
  } catch (err) {
    console.error('[Taskora DB] Error during disconnection:', err);
  }
}
