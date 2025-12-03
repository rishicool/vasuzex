/**
 * Generate App Command
 * Creates proper Laravel-style app structure with inheritance and authentication
 */

import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function generateApp(name, options) {
  const type = options.type || 'api';
  
  // Validate app type
  const validTypes = ['api', 'web'];
  if (!validTypes.includes(type)) {
    console.error(`❌ Invalid app type: ${type}`);
    console.log('Valid types: api, web');
    process.exit(1);
  }
  
  // Structure: apps/name/api/ or apps/name/web/
  const appDir = join(process.cwd(), 'apps', name);
  const targetDir = join(appDir, type);

  console.log(`🚀 Generating ${type.toUpperCase()} Application: ${name}\n`);

  // Check if already exists
  if (existsSync(targetDir)) {
    console.error(`❌ Error: App already exists at ${targetDir}`);
    console.log('💡 Delete the existing directory first or use a different name.');
    process.exit(1);
  }

  try {
    // Create directory structure
    await mkdir(join(targetDir, 'src'), { recursive: true });
    await mkdir(join(targetDir, 'src', 'controllers'), { recursive: true });
    await mkdir(join(targetDir, 'src', 'routes'), { recursive: true });
    await mkdir(join(targetDir, 'src', 'middleware'), { recursive: true });
    await mkdir(join(targetDir, 'src', 'requests'), { recursive: true });

    // Generate package.json
    const packageJson = {
      name: `@vasuzex/${name}-${type}`,
      version: '1.0.0',
      description: `${name} ${type} application`,
      type: 'module',
      private: true,
      scripts: {
        dev: 'nodemon src/index.js',
        start: 'node src/index.js',
      },
      dependencies: {
        express: '^4.21.2',
        cors: '^2.8.5',
        helmet: '^8.0.0',
        'express-rate-limit': '^7.5.0',
      },
      devDependencies: {
        nodemon: '^3.1.11',
      },
    };

    await writeFile(
      join(targetDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    // Generate nodemon.json
    const nodemonConfig = {
      watch: ['src'],
      ext: 'js,json',
      ignore: ['node_modules'],
      exec: 'node src/index.js',
    };

    await writeFile(
      join(targetDir, 'nodemon.json'),
      JSON.stringify(nodemonConfig, null, 2)
    );

    // Generate .env.example
    const envExample = `# ${name.toUpperCase()} ${type.toUpperCase()} Configuration
APP_NAME=${name}-${type}
APP_PORT=3000
APP_ENV=development

# Database (if needed)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=${name}_db
DB_USER=postgres
DB_PASSWORD=

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
`;

    await writeFile(join(targetDir, '.env.example'), envExample);

    // Generate main index.js
    const indexCode = `/**
 * ${name} ${type.toUpperCase()} Application
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Application } from '#framework/Foundation/Application.js';
import { routes } from './routes/index.js';

const PORT = process.env.APP_PORT || 3000;

// Bootstrap framework
const app = new Application(process.cwd());

// Create Express app
const server = express();

// Middleware
server.use(helmet());
server.use(cors());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
server.use('/api', limiter);

// Routes
server.use('/api', routes);

// Health check
server.get('/health', (req, res) => {
  res.json({
    success: true,
    service: '${name}-${type}',
    status: 'healthy',
    timestamp: new Date().toISOString(),
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
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// Start server
server.listen(PORT, () => {
  console.log(\`🚀 \${process.env.APP_NAME || '${name}-${type}'} started\`);
  console.log(\`📡 Port: \${PORT}\`);
  console.log(\`🌐 URL: http://localhost:\${PORT}\`);
  console.log(\`📝 Environment: \${process.env.APP_ENV || 'development'}\`);
});

export default server;
`;

    await writeFile(join(targetDir, 'src', 'index.js'), indexCode);

    // Generate routes/index.js
    const routesCode = `/**
 * Routes
 */

import express from 'express';
import { exampleRoutes } from './example.routes.js';

const router = express.Router();

// Mount routes
router.use('/example', exampleRoutes);

export const routes = router;
`;

    await writeFile(join(targetDir, 'src', 'routes', 'index.js'), routesCode);

    // Generate routes/example.routes.js
    const exampleRoutesCode = `/**
 * Example Routes
 */

import express from 'express';
import { ExampleController } from '../controllers/ExampleController.js';

const router = express.Router();
const controller = new ExampleController();

router.get('/', controller.index);
router.post('/', controller.store);

export const exampleRoutes = router;
`;

    await writeFile(
      join(targetDir, 'src', 'routes', 'example.routes.js'),
      exampleRoutesCode
    );

    // Generate controllers/ExampleController.js
    const controllerCode = `/**
 * Example Controller
 */

export class ExampleController {
  /**
   * GET /api/example
   */
  async index(req, res) {
    try {
      res.json({
        success: true,
        message: 'Welcome to ${name} ${type}',
        data: [],
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * POST /api/example
   */
  async store(req, res) {
    try {
      const data = req.body;
      
      res.status(201).json({
        success: true,
        message: 'Created successfully',
        data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}
`;

    await writeFile(
      join(targetDir, 'src', 'controllers', 'ExampleController.js'),
      controllerCode
    );

    // Generate README
    const readme = `# ${name} ${type.toUpperCase()}

${name} ${type} application.

## Installation

\`\`\`bash
cd apps/${name}/${type}
pnpm install
\`\`\`

## Development

\`\`\`bash
pnpm dev
\`\`\`

Server runs on: http://localhost:3000

## API Endpoints

### Health Check
\`\`\`
GET /health
\`\`\`

### Example
\`\`\`
GET /api/example
POST /api/example
\`\`\`

## Configuration

Configure in \`.env\`:

\`\`\`env
APP_NAME=${name}-${type}
APP_PORT=3000
APP_ENV=development
\`\`\`

## Production

\`\`\`bash
pnpm start
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

    console.log('✅ App generated successfully!\n');
    console.log('📁 Location:', targetDir);
    console.log('\n📝 Next steps:');
    console.log(`  1. cd apps/${name}/${type}`);
    console.log('  2. pnpm install');
    console.log('  3. Copy .env.example to .env and configure');
    console.log('  4. pnpm dev');
    console.log('\n🌐 Server will run on: http://localhost:3000');
  } catch (error) {
    console.error('❌ Error generating app:', error.message);
    process.exit(1);
  }
}
