// ============================================================================
// EXPRESS APPLICATION CONFIGURATION
// Sets up CORS, JSON body parsers, REST route mounts, and central error handlers
// Separated from server.js to enable supertest integration testing without port binding
// ============================================================================

import express from 'express';
import cors from 'cors';

// Route Handlers
import authRoutes from './routes/authRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import subjectRoutes from './routes/subjectRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

// Error Middlewares
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js';

const app = express();

// Configure CORS for local development and production origin
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      if (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost:\d+$/.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error('CORS policy: This origin is not allowed'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Standard JSON and URL-encoded parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    application: 'Taskora Backend REST API',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// REST API Route Mounts
app.use('/api/auth', authRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Catch 404 for undefined endpoints
app.use(notFoundHandler);

// Centralized Error Handling
app.use(errorHandler);

export default app;
