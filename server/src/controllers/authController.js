// ============================================================================
// AUTHENTICATION CONTROLLER
// Handles administrator login, password verification, and session validation
// ============================================================================

import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

/**
 * Generates a signed JWT for the given user ID
 */
function generateToken(id) {
  const secret = process.env.JWT_SECRET || 'taskora_development_jwt_secret_key_change_in_production_123456';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id }, secret, { expiresIn });
}

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate administrator and return JWT token
 * @access  Public
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email address and password.',
      });
    }

    // Check if user exists (explicitly select password since select: false in schema)
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    // Verify password hash
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password does not match.',
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @route   GET /api/auth/me
 * @desc    Get currently authenticated administrator profile
 * @access  Protected
 */
export async function getMe(req, res, next) {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (err) {
    next(err);
  }
}
