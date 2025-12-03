/**
 * Generate Media Server Command
 */

import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync, readFileSync } from 'fs';

export async function generateMediaServer(options) {
  const port = options.port || '4003';
  const targetDir = join(process.cwd(), 'apps', 'media-server');

  console.log('🖼️  Generating Media Server...\n');

  // Check if already exists
  if (existsSync(targetDir)) {
    console.error(`❌ Error: Media server already exists at ${targetDir}`);
    console.log('💡 Delete the existing directory first or use a different location.');
    process.exit(1);
  }

  try {
    // Create directory structure
    await mkdir(targetDir, { recursive: true });
    await mkdir(join(targetDir, 'src'), { recursive: true });
    await mkdir(join(targetDir, 'src', 'controllers'), { recursive: true });
    await mkdir(join(targetDir, 'src', 'routes'), { recursive: true });
    await mkdir(join(targetDir, 'config'), { recursive: true });

    // Generate package.json
    const packageJson = {
      name: '@vasuzex/media-server',
      version: '1.0.0',
      description: 'Centralized media server for dynamic thumbnail generation',
      type: 'module',
      private: true,
      scripts: {
        dev: 'nodemon src/index.js',
        start: 'node src/index.js',
      },
      dependencies: {
        '@vasuzex/framework': 'workspace:*',
        express: '^4.21.2',
        cors: '^2.8.5',
        helmet: '^8.0.0',
        sharp: '^0.33.5',
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
      ignore: ['node_modules', 'uploads'],
      exec: 'node src/index.js',
    };

    await writeFile(
      join(targetDir, 'nodemon.json'),
      JSON.stringify(nodemonConfig, null, 2)
    );

    // Generate .env.example
    const envExample = `# Media Server Configuration
MEDIA_SERVER_PORT=${port}

# Storage Configuration (uses framework's storage config)
STORAGE_DRIVER=local

# Cache Configuration
MEDIA_CACHE_PATH=./storage/media/cache
MEDIA_CACHE_TTL=604800000

# Thumbnail Settings
MEDIA_MAX_WIDTH=2048
MEDIA_MAX_HEIGHT=2048
MEDIA_QUALITY=85
MEDIA_STRICT_SIZES=false
`;

    await writeFile(join(targetDir, '.env.example'), envExample);
    
    // Copy .env file
    await writeFile(join(targetDir, '.env'), envExample);

    // Generate config/app.cjs
    const appConfigCode = `module.exports = {
  name: 'media-server',
  port: process.env.MEDIA_SERVER_PORT || ${port},
  env: process.env.NODE_ENV || 'development',
  debug: process.env.NODE_ENV !== 'production',
};
`;
    await writeFile(join(targetDir, 'config', 'app.cjs'), appConfigCode);

    // Generate ImageController
    const imageControllerCode = `/**
 * Image Controller
 * Handles dynamic image thumbnail requests
 */

import { Controller } from '@vasuzex/framework/Http/Controller.js';
import { Media } from '@vasuzex/framework/Support/Facades/Media.js';

export class ImageController extends Controller {
  /**
   * GET /image/*?w=300&h=300
   * Get image with optional thumbnail dimensions
   */
  getImage = async (req, res) => {
    try {
      let imagePath = req.params[0];
      let { w, h } = req.query;

      if (!imagePath) {
        return this.error(res, 'Image path is required', 400);
      }

      // Add uploads/ prefix if not present
      if (!imagePath.startsWith('uploads/')) {
        imagePath = \`uploads/\${imagePath}\`;
      }

      // Default dimensions if not specified
      if (!w || !h) {
        w = '800';
        h = '800';
      }

      // Parse dimensions
      const width = parseInt(w, 10);
      const height = parseInt(h, 10);

      if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
        return this.error(res, 'Invalid width or height values', 400);
      }

      // Get or generate image
      const result = await Media.getImage(imagePath, width, height);

      // Set cache headers
      res.set({
        'Content-Type': result.contentType,
        'Cache-Control': 'public, max-age=604800',
        'X-Cache': result.fromCache ? 'HIT' : 'MISS',
      });

      res.send(result.buffer);
    } catch (error) {
      console.error('Error serving image:', error);

      if (error.message.includes('Invalid thumbnail size')) {
        return this.error(res, error.message, 400);
      }

      if (error.message.includes('not found') || error.message.includes('ENOENT')) {
        return this.error(res, 'Image not found', 404);
      }

      return this.error(res, 'Failed to process image', 500);
    }
  };

  /**
   * GET /sizes
   * Get list of allowed thumbnail sizes
   */
  getAllowedSizes = async (req, res) => {
    try {
      const sizes = await Media.getAllowedSizes();
      return this.success(res, sizes, 'Allowed thumbnail sizes retrieved');
    } catch (error) {
      console.error('Error getting sizes:', error);
      return this.error(res, 'Failed to get sizes', 500);
    }
  };

  /**
   * GET /cache/stats
   * Get cache statistics
   */
  getCacheStats = async (req, res) => {
    try {
      const stats = await Media.getCacheStats();
      return this.success(res, stats, 'Cache statistics retrieved');
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return this.error(res, 'Failed to get cache stats', 500);
    }
  };

  /**
   * DELETE /cache/clear
   * Clear expired cache
   */
  clearExpiredCache = async (req, res) => {
    try {
      const cleared = await Media.clearExpiredCache();
      return this.success(res, { cleared }, \`Cleared \${cleared} expired thumbnails\`);
    } catch (error) {
      console.error('Error clearing cache:', error);
      return this.error(res, 'Failed to clear cache', 500);
    }
  };

  /**
   * GET /health
   * Health check
   */
  health = async (req, res) => {
    return this.success(res, {
      status: 'healthy',
      service: 'media-server',
      timestamp: new Date().toISOString(),
    });
  };
}
`;

    await writeFile(
      join(targetDir, 'src', 'controllers', 'ImageController.js'),
      imageControllerCode
    );

    // Generate image routes
    const imageRoutesCode = `/**
 * Image Routes
 */

import { Router } from 'express';
import { ImageController } from '../controllers/ImageController.js';

const router = Router();
const controller = new ImageController();

/**
 * @route   GET /sizes
 * @desc    Get list of allowed thumbnail sizes
 * @access  Public
 */
router.get('/sizes', controller.getAllowedSizes);

/**
 * @route   GET /cache/stats
 * @desc    Get cache statistics
 * @access  Public
 */
router.get('/cache/stats', controller.getCacheStats);

/**
 * @route   DELETE /cache/clear
 * @desc    Clear expired cache
 * @access  Public
 */
router.delete('/cache/clear', controller.clearExpiredCache);

/**
 * @route   GET /*
 * @desc    Get image with optional thumbnail dimensions
 * @query   w - Width in pixels (optional, default: 800)
 * @query   h - Height in pixels (optional, default: 800)
 * @access  Public
 * 
 * Examples:
 * - GET /image/uploads/products/123/photo.jpg (800x800)
 * - GET /image/uploads/products/123/photo.jpg?w=400&h=400 (400x400)
 */
router.get('/*', controller.getImage);

export default router;
`;

    await writeFile(
      join(targetDir, 'src', 'routes', 'image.routes.js'),
      imageRoutesCode
    );

    // Generate routes index
    const routesIndexCode = `/**
 * Setup Routes
 */

import imageRoutes from './image.routes.js';

export function setupRoutes(server) {
  // Image routes
  server.use('/image', imageRoutes);

  // Health check
  server.get('/health', (req, res) => {
    res.json({
      success: true,
      status: 'healthy',
      service: 'media-server',
      timestamp: new Date().toISOString(),
    });
  });

  // 404 handler
  server.use((req, res) => {
    res.status(404).json({
      success: false,
      message: 'Endpoint not found',
    });
  });
}
`;

    await writeFile(
      join(targetDir, 'src', 'routes', 'index.js'),
      routesIndexCode
    );

    // Generate main index.js
    const indexCode = `/**
 * Media Server
 * Centralized server for serving images with dynamic thumbnail generation
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Application } from '@vasuzex/framework/Foundation/Application.js';
import { MediaServiceProvider } from '@vasuzex/framework/Services/Media/MediaServiceProvider.js';

const PORT = process.env.MEDIA_SERVER_PORT || ${port};

// Bootstrap framework application
const app = new Application(process.cwd());
await app.boot();
app.register(MediaServiceProvider);

// Create Express app
const server = app.express;

// CORS - allow all origins for media server
server.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'HEAD', 'DELETE'],
}));

// Security headers
server.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

server.use(express.json());

// Import routes
const { setupRoutes } = await import('./routes/index.js');
setupRoutes(server);

// Error handler
server.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

// Start server
server.listen(PORT, () => {
  console.log('🖼️  Media Server Started');
  console.log(\`📡 Port: \${PORT}\`);
  console.log(\`🌐 URL: http://localhost:\${PORT}\`);
  console.log('');
  console.log('Endpoints:');
  console.log(\`  GET  /image/:path?w=800&h=800  - Get image/thumbnail\`);
  console.log(\`  GET  /image/sizes              - Get allowed sizes\`);
  console.log(\`  GET  /image/cache/stats        - Get cache stats\`);
  console.log(\`  DELETE /image/cache/clear      - Clear expired cache\`);
  console.log(\`  GET  /health                   - Health check\`);
});

export default app;
`;

    await writeFile(join(targetDir, 'src', 'index.js'), indexCode);

    // Generate README
    const readme = `# Media Server

Centralized media server for dynamic thumbnail generation.

## Installation

\`\`\`bash
cd apps/media-server
pnpm install
\`\`\`

## Development

\`\`\`bash
pnpm dev
\`\`\`

Server runs on: http://localhost:${port}

## Usage

### Get Thumbnail
\`\`\`
GET http://localhost:${port}/image/uploads/products/123/photo.jpg?w=400&h=400
\`\`\`

### Get Allowed Sizes
\`\`\`
GET http://localhost:${port}/sizes
\`\`\`

### Get Cache Stats
\`\`\`
GET http://localhost:${port}/cache/stats
\`\`\`

### Clear Cache
\`\`\`
DELETE http://localhost:${port}/cache/clear
\`\`\`

## Configuration

Configure in root \`.env\`:

\`\`\`env
MEDIA_SERVER_PORT=${port}
STORAGE_DRIVER=local
MEDIA_CACHE_PATH=./storage/media/cache
\`\`\`

## Production

\`\`\`bash
pnpm start
\`\`\`
`;

    await writeFile(join(targetDir, 'README.md'), readme);

    // Update root package.json scripts
    console.log('\n🔧 Updating root package.json scripts...');
    const rootPackageJsonPath = join(process.cwd(), 'package.json');
    const rootPackageJson = JSON.parse(readFileSync(rootPackageJsonPath, 'utf-8'));
    
    rootPackageJson.scripts['dev:media-server'] = 'turbo run dev --filter=@vasuzex/media-server';
    rootPackageJson.scripts['start:media-server'] = 'turbo run start --filter=@vasuzex/media-server';
    
    await writeFile(rootPackageJsonPath, JSON.stringify(rootPackageJson, null, 2) + '\n');
    console.log('✅ Added scripts: pnpm dev:media-server, pnpm start:media-server');

    console.log('\n✅ Media server generated successfully!\n');
    console.log('📁 Location:', targetDir);
    console.log('📁 Structure:');
    console.log('   apps/media-server/');
    console.log('   ├── src/');
    console.log('   │   ├── controllers/  (ImageController.js)');
    console.log('   │   ├── routes/       (image.routes.js, index.js)');
    console.log('   │   └── index.js      (Framework bootstrap)');
    console.log('   ├── config/           (app.cjs)');
    console.log('   ├── .env');
    console.log('   └── package.json');
    console.log('');
    
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
    console.log('  1. pnpm dev:media-server');
    console.log(`\n🌐 Server will run on: http://localhost:${port}`);
  } catch (error) {
    console.error('❌ Error generating media server:', error.message);
    process.exit(1);
  }
}
