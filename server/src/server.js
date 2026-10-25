// ============================================================================
// TASKORA BACKEND SERVER ENTRY POINT
// Boots the database connection and listens on the configured port
// ============================================================================

import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Start Express HTTP Server
    const server = app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 Taskora Backend REST API running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Base URL: http://localhost:${PORT}/api`);
      console.log(`====================================================`);
    });

    // Handle graceful shutdown
    const handleShutdown = () => {
      console.log('[Taskora Server] Shutting down gracefully...');
      server.close(() => {
        console.log('[Taskora Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', handleShutdown);
    process.on('SIGINT', handleShutdown);
  } catch (err) {
    console.error('[Taskora Server] Fatal startup error:', err);
    process.exit(1);
  }
}

startServer();
