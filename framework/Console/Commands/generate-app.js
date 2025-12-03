/**
 * Generate App Command
 * Creates proper Laravel-style app structure with inheritance and authentication
 */

import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync, readFileSync } from 'fs';

export async function generateApp(name, options) {
  const type = options.type;
  
  // If no type specified, generate both api and web
  if (!type) {
    console.log(`🚀 Generating BOTH API and WEB Applications for: ${name}\n`);
    await generateSingleApp(name, 'api');
    console.log('\n' + '='.repeat(60) + '\n');
    await generateSingleApp(name, 'web');
    return;
  }
  
  // Validate app type
  const validTypes = ['api', 'web'];
  if (!validTypes.includes(type)) {
    console.error(`❌ Invalid app type: ${type}`);
    console.log('Valid types: api, web');
    process.exit(1);
  }
  
  await generateSingleApp(name, type);
}

async function generateSingleApp(name, type) {
  // Structure: apps/name/api/ or apps/name/web/
  const appDir = join(process.cwd(), 'apps', name);
  const targetDir = join(appDir, type);

  console.log(`🚀 Generating ${type.toUpperCase()} Application: ${name}/${type}\n`);

  // Check if already exists
  if (existsSync(targetDir)) {
    console.error(`❌ Error: App already exists at ${targetDir}`);
    console.log('💡 Delete the existing directory first or use a different name.');
    process.exit(1);
  }

  try {
    // Create directory structure
    await mkdir(join(targetDir, 'src', 'controllers'), { recursive: true });
    await mkdir(join(targetDir, 'src', 'models'), { recursive: true });
    await mkdir(join(targetDir, 'src', 'services'), { recursive: true });
    await mkdir(join(targetDir, 'src', 'middleware'), { recursive: true });
    await mkdir(join(targetDir, 'src', 'routes'), { recursive: true });
    await mkdir(join(targetDir, 'src', 'requests'), { recursive: true });
    await mkdir(join(targetDir, 'config'), { recursive: true });

    // Generate package.json with imports for framework paths
    const packageJson = {
      name: `${name}-${type}`,
      version: '1.0.0',
      description: `${name} ${type} application`,
      type: 'module',
      private: true,
      scripts: {
        dev: 'nodemon src/index.js',
        start: 'node src/index.js',
      },
      dependencies: {
        vasuzex: '^1.0.0',
        guruorm: '^1.17.6',
        express: '^4.21.2',
        cors: '^2.8.5',
        helmet: '^8.0.0',
        'express-rate-limit': '^7.5.0',
        bcryptjs: '^2.4.3',
        jsonwebtoken: '^9.0.2',
        joi: '^17.13.3',
        dotenv: '^16.4.7',
      },
      devDependencies: {
        nodemon: '^3.1.11',
      },
    };

    await writeFile(
      join(targetDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    // Generate .env.example
    const envExample = `# ${name.toUpperCase()} ${type.toUpperCase()} Configuration
APP_NAME=${name}-${type}
APP_PORT=3000
APP_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=${name}_db
DB_USER=postgres
DB_PASSWORD=

# JWT Authentication
JWT_SECRET=change-this-to-a-random-secret-key
JWT_EXPIRES_IN=7d
`;

    await writeFile(join(targetDir, '.env.example'), envExample);
    
    // Copy .env.example to .env
    await writeFile(join(targetDir, '.env'), envExample);

    // Generate config/app.cjs
    const appConfigCode = `/**
 * Application Configuration
 */

module.exports = {
  name: process.env.APP_NAME || '${name}-${type}',
  port: process.env.APP_PORT || 3000,
  env: process.env.APP_ENV || 'development',
  debug: process.env.APP_DEBUG === 'true',
  
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'change-this-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
};
`;

    await writeFile(join(targetDir, 'config', 'app.cjs'), appConfigCode);

    // Generate src/index.js (Application bootstrap)
    const indexCode = `/**
 * ${name.charAt(0).toUpperCase() + name.slice(1)} ${type.toUpperCase()} Application
 */

import { Application } from 'vasuzex/Foundation/Application.js';

// Create application instance
const app = new Application(process.cwd());

// Bootstrap application
await app.boot();

// Get Express app
const server = app.express;

// Import routes
const { setupRoutes } = await import('./routes/index.js');
setupRoutes(server);

// Start server
const PORT = process.env.APP_PORT || 3000;
server.listen(PORT, () => {
  console.log(\`🚀 \${process.env.APP_NAME || '${name}-${type}'} started on port \${PORT}\`);
  console.log(\`🌐 URL: http://localhost:\${PORT}\`);
});

export default app;
`;

    await writeFile(join(targetDir, 'src', 'index.js'), indexCode);

    // Generate base Controller class (extends framework Controller)
    const baseControllerCode = `/**
 * Base Controller
 * Extends framework Controller with app-specific helpers
 */

import { Controller } from 'vasuzex/Http/Controller.js';

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

    await writeFile(
      join(targetDir, 'src', 'controllers', 'BaseController.js'),
      baseControllerCode
    );

    // Generate AuthController with authentication example
    const authControllerCode = `/**
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

    await writeFile(
      join(targetDir, 'src', 'controllers', 'AuthController.js'),
      authControllerCode
    );

    // Generate User model (uses framework patterns with GuruORM)
    const userModelCode = `/**
 * User Model
 * Represents a user in the system
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

    await writeFile(
      join(targetDir, 'src', 'models', 'User.js'),
      userModelCode
    );

    // Generate AuthService
    const authServiceCode = `/**
 * Authentication Service
 * Business logic for authentication
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

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

    await writeFile(
      join(targetDir, 'src', 'services', 'AuthService.js'),
      authServiceCode
    );

    // Generate auth middleware
    const authMiddlewareCode = `/**
 * Authentication Middleware
 * Verify JWT token and attach user to request
 */

import { AuthService } from '../services/AuthService.js';
import { User } from '../models/User.js';

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

    await writeFile(
      join(targetDir, 'src', 'middleware', 'authMiddleware.js'),
      authMiddlewareCode
    );

    // Generate error handler middleware
    const errorHandlerCode = `/**
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

    await writeFile(
      join(targetDir, 'src', 'middleware', 'errorHandler.js'),
      errorHandlerCode
    );

    // Generate validation requests
    const authRequestsCode = `/**
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

    await writeFile(
      join(targetDir, 'src', 'requests', 'AuthRequests.js'),
      authRequestsCode
    );

    // Generate auth routes
    const authRoutesCode = `/**
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

    await writeFile(
      join(targetDir, 'src', 'routes', 'auth.routes.js'),
      authRoutesCode
    );

    // Generate main routes file
    const routesCode = `/**
 * API Routes
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { authRoutes } from './auth.routes.js';

export function setupRoutes(server) {
  // Security middleware
  server.use(helmet());
  server.use(cors());
  
  // Body parsing
  server.use(express.json());
  server.use(express.urlencoded({ extended: true }));
  
  // API Routes
  server.use('/api/auth', authRoutes);
  
  // Health check
  server.get('/health', (req, res) => {
    res.json({
      success: true,
      service: process.env.APP_NAME || '${name}-${type}',
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  });
  
  // Example protected route
  server.get('/api/protected', (req, res) => {
    res.json({
      success: true,
      message: 'This is a protected route',
    });
  });
  
  // 404 handler
  server.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Route not found',
    });
  });
  
  // Error handler
  server.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal server error',
    });
  });
}
`;

    await writeFile(join(targetDir, 'src', 'routes', 'index.js'), routesCode);

    // Generate README
    const readme = `# ${name} ${type.toUpperCase()}

${name} ${type} application with authentication.

## Structure

\`\`\`
apps/${name}/${type}/
├── src/
│   ├── controllers/         # Controllers (extend base Controller)
│   │   ├── Controller.js   # Base controller
│   │   └── AuthController.js
│   ├── models/             # Models (database entities)
│   │   └── User.js
│   ├── services/           # Business logic
│   │   └── AuthService.js
│   ├── middleware/         # Express middleware
│   │   ├── authMiddleware.js
│   │   └── errorHandler.js
│   ├── routes/             # API routes
│   │   ├── index.js
│   │   └── auth.routes.js
│   ├── requests/           # Request validators
│   │   └── AuthRequests.js
│   ├── index.js            # Framework bootstrap
│   └── server.js           # Express server
├── package.json
└── .env.example
\`\`\`

## Installation

\`\`\`bash
cd apps/${name}/${type}
pnpm install
cp .env.example .env
\`\`\`

## Development

\`\`\`bash
pnpm dev
\`\`\`

## API Endpoints

### Health Check
\`\`\`
GET /health
\`\`\`

### Authentication
\`\`\`
POST /api/auth/register  - Register new user
POST /api/auth/login     - Login user
GET  /api/auth/me        - Get current user (protected)
POST /api/auth/logout    - Logout (protected)
\`\`\`

## Authentication Flow

1. **Register:**
\`\`\`bash
curl -X POST http://localhost:3000/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{"name":"John","email":"john@example.com","password":"123456"}'
\`\`\`

2. **Login:**
\`\`\`bash
curl -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"john@example.com","password":"123456"}'
\`\`\`

3. **Access Protected Route:**
\`\`\`bash
curl -X GET http://localhost:3000/api/auth/me \\
  -H "Authorization: Bearer YOUR_TOKEN"
\`\`\`

## Environment Variables

\`\`\`env
APP_NAME=${name}-${type}
APP_PORT=3000
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
\`\`\`
`;

    await writeFile(join(targetDir, 'README.md'), readme);

    // Create .gitignore
    const gitignore = `node_modules
.env
dist
.turbo
*.log
`;

    await writeFile(join(targetDir, '.gitignore'), gitignore);

    // Add dev/start scripts to root package.json BEFORE installing
    try {
      const rootPackageJsonPath = join(process.cwd(), 'package.json');
      const rootPackageJson = JSON.parse(readFileSync(rootPackageJsonPath, 'utf-8'));
      
      const devScriptName = `dev:${name}-${type}`;
      const startScriptName = `start:${name}-${type}`;
      const filterName = `${name}-${type}`;
      
      let scriptsAdded = [];
      
      if (!rootPackageJson.scripts[devScriptName]) {
        rootPackageJson.scripts[devScriptName] = `turbo run dev --filter=${filterName}`;
        scriptsAdded.push(`pnpm ${devScriptName}`);
      }
      
      if (!rootPackageJson.scripts[startScriptName]) {
        rootPackageJson.scripts[startScriptName] = `turbo run start --filter=${filterName}`;
        scriptsAdded.push(`pnpm ${startScriptName}`);
      }
      
      if (scriptsAdded.length > 0) {
        await writeFile(
          rootPackageJsonPath,
          JSON.stringify(rootPackageJson, null, 2) + '\n'
        );
        
        console.log(`\n✅ Added scripts: ${scriptsAdded.join(', ')}`);
      }
    } catch (error) {
      console.log('\n⚠️  Could not add scripts to root package.json');
    }

    console.log('\n✅ App generated successfully!\n');
    console.log('📁 Structure:');
    console.log(`   apps/${name}/`);
    console.log(`   └── ${type}/`);
    console.log('       ├── src/');
    console.log('       │   ├── controllers/  (Controller.js, AuthController.js)');
    console.log('       │   ├── models/       (User.js)');
    console.log('       │   ├── services/     (AuthService.js)');
    console.log('       │   ├── middleware/   (authMiddleware.js, errorHandler.js)');
    console.log('       │   ├── routes/       (auth.routes.js)');
    console.log('       │   ├── requests/     (AuthRequests.js)');
    console.log('       │   ├── index.js      (Framework bootstrap)');
    console.log('       │   └── server.js     (Express server)');
    console.log('       └── package.json\n');
    
    // Install dependencies from root (to link workspace packages)
    console.log('\n📦 Installing dependencies...\n');
    const { execSync } = await import('child_process');
    try {
      execSync('pnpm install', {
        cwd: process.cwd(), // Run from root directory
        stdio: 'inherit',
      });
      console.log('\n✅ Dependencies installed!\n');
    } catch (error) {
      console.log('\n⚠️  Failed to install dependencies. Run manually:\n');
      console.log(`  pnpm install\n`);
    }

    console.log('📝 Next steps:');
    console.log(`  1. cd apps/${name}/${type}`);
    console.log('  2. cp .env.example .env');
    console.log('  3. Update JWT_SECRET in .env');
    console.log('  4. Run migrations: pnpm framework -- migrate');
    console.log('  5. Start dev server: pnpm dev\n');
    
    console.log('🔐 Authentication endpoints:');
    console.log('   POST /api/auth/register');
    console.log('   POST /api/auth/login');
    console.log('   GET  /api/auth/me (protected)');
    console.log('   POST /api/auth/logout (protected)\n');
  } catch (error) {
    console.error('❌ Error generating app:', error.message);
    process.exit(1);
  }
}
