// ============================================================================
// AUTHENTICATION MIDDLEWARE (JWT Verification)
// Intercepts incoming requests and verifies JSON Web Tokens
// ============================================================================

import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export async function protect(req, res, next) {
  let token;

  // Extract Bearer token from HTTP Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authentication token is missing.',
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'taskora_development_jwt_secret_key_change_in_production_123456';
    const decoded = jwt.verify(token, secret);

    // Attach user information to request object (excluding password hash)
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please log in again.',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token.',
    });
  }
}
