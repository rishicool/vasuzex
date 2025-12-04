/**
 * API Templates
 * Templates for API-specific files (controllers, models, routes, etc.)
 */

/**
 * Generate BaseController
 */
export function generateBaseControllerTemplate() {
  return `/**
 * Base Controller
 * Extends framework Controller with app-specific helpers
 */

import { Controller } from 'vasuzex';

export class BaseController extends Controller {
  /**
   * Paginate response helper
   */
  paginate(res, data, total, page = 1, perPage = 15) {
    const lastPage = Math.ceil(total / perPage);
    return this.success(res, {
      items: data,
      pagination: {
        total,
        perPage,
        currentPage: page,
        lastPage,
        hasMore: page < lastPage,
      },
    });
  }
}
`;
}

/**
 * Generate AuthController
 */
export function generateAuthControllerTemplate() {
  return `/**
 * Authentication Controller
 * Handles user registration, login, and authentication
 */

import { BaseController } from './BaseController.js';
import { AuthService } from '../services/AuthService.js';
import { LoginRequest, RegisterRequest } from '../requests/AuthRequests.js';

export class AuthController extends BaseController {
  constructor() {
    super();
    this.authService = new AuthService();
  }

  /**
   * POST /api/auth/register
   * Register a new user
   */
  register = async (req, res) => {
    try {
      // Validate request
      const { error, value } = RegisterRequest.validate(req.body);
      if (error) {
        return this.validationError(res, error.details);
      }

      // Register user
      const result = await this.authService.register(value);

      return this.success(res, result, 'Registration successful', 201);
    } catch (error) {
      console.error('Registration error:', error);
      return this.error(res, error.message, 400);
    }
  };

  /**
   * POST /api/auth/login
   * Login user
   */
  login = async (req, res) => {
    try {
      // Validate request
      const { error, value } = LoginRequest.validate(req.body);
      if (error) {
        return this.validationError(res, error.details);
      }

      // Login user
      const result = await this.authService.login(value.email, value.password);

      return this.success(res, result, 'Login successful');
    } catch (error) {
      console.error('Login error:', error);
      return this.unauthorized(res, error.message);
    }
  };

  /**
   * GET /api/auth/me
   * Get current user
   */
  me = async (req, res) => {
    try {
      const user = req.user; // Set by auth middleware

      return this.success(res, user, 'User retrieved successfully');
    } catch (error) {
      console.error('Get user error:', error);
      return this.error(res, error.message);
    }
  };

  /**
   * POST /api/auth/logout
   * Logout user
   */
  logout = async (req, res) => {
    try {
      // In JWT, logout is handled client-side by removing the token
      // Here you can add token to blacklist if needed

      return this.success(res, null, 'Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      return this.error(res, error.message);
    }
  };
}
`;
}

/**
 * Generate User model
 */
export function generateUserModelTemplate() {
  return `/**
 * User Model
 * Can extend centralized models or create app-specific models
 */

import { Model } from 'guruorm';

export class User extends Model {
  static table = 'users';
  
  static fillable = ['name', 'email', 'password'];
  
  static hidden = ['password'];
  
  /**
   * Find user by email
   */
  static async findByEmail(email) {
    return await this.query().where('email', email).first();
  }
}
`;
}

/**
 * Generate AuthService
 */
export function generateAuthServiceTemplate() {
  return `/**
 * Authentication Service
 * Business logic for authentication
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
// Import from centralized models (5 levels up: services→src→api→{name}→apps→root)
import { User } from '../../../../../database/models/User.js';

export class AuthService {
  /**
   * Register a new user
   */
  async register(data) {
    // Check if user already exists
    const existingUser = await User.findByEmail(data.email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await User.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
    });

    // Generate token
    const token = this.generateToken(user);

    // Remove password from response
    delete user.password;

    return {
      user,
      token,
    };
  }

  /**
   * Login user
   */
  async login(email, password) {
    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken(user);

    // Remove password from response
    delete user.password;

    return {
      user,
      token,
    };
  }

  /**
   * Generate JWT token
   */
  generateToken(user) {
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email 
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  /**
   * Verify JWT token
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'secret');
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}
`;
}

/**
 * Generate auth middleware
 */
export function generateAuthMiddlewareTemplate() {
  return `/**
 * Authentication Middleware
 * Verify JWT token and attach user to request
 */

import { AuthService } from '../services/AuthService.js';
// Import from centralized models (5 levels up: middleware→src→api→{name}→apps→root)
import { User } from '../../../../../database/models/User.js';

export async function authMiddleware(req, res, next) {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    // Verify token
    const authService = new AuthService();
    const decoded = authService.verifyToken(token);

    // Get user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    // Remove password
    delete user.password;

    // Attach user to request
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }
}
`;
}

/**
 * Generate error handler middleware
 */
export function generateErrorHandlerTemplate() {
  return `/**
 * Global Error Handlers
 */

/**
 * 404 Not Found Handler
 */
export function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
}

/**
 * Global Error Handler
 */
export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.APP_ENV === 'development' && { stack: err.stack }),
  });
}
`;
}

/**
 * Generate AuthRequests validators
 */
export function generateAuthRequestsTemplate() {
  return `/**
 * Authentication Request Validators
 */

import Joi from 'joi';

export const RegisterRequest = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const LoginRequest = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
`;
}

/**
 * Generate auth routes
 */
export function generateAuthRoutesTemplate() {
  return `/**
 * Authentication Routes
 */

import express from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
const authController = new AuthController();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/me', authMiddleware, authController.me);
router.post('/logout', authMiddleware, authController.logout);

export const authRoutes = router;
`;
}

/**
 * Generate routes/index.js
 */
export function generateRoutesIndexTemplate() {
  return `/**
 * Route Registry
 * Central place to register all routes
 */

import { authRoutes } from './auth.routes.js';

/**
 * Health check route (can be used separately)
 */
export const healthRoutes = (req, res) => {
  res.json({
    success: true,
    service: process.env.APP_NAME,
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
};

/**
 * Get all routes with their base paths
 * @returns {Array} Array of route definitions
 */
export function getAllRoutes() {
  return [
    { path: '/health', handler: healthRoutes },
    { path: '/api/auth', router: authRoutes },
    // Add more routes here as your app grows
    // { path: '/api/users', router: userRoutes },
    // { path: '/api/posts', router: postRoutes },
  ];
}
`;
}
