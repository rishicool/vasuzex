/**
 * Media Server
 * Centralized server for serving images with dynamic thumbnail generation
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Application } from '@vasuzex/framework/Foundation/Application.js';
import { MediaServiceProvider } from '@vasuzex/framework/Services/Media/MediaServiceProvider.js';

const PORT = process.env.MEDIA_SERVER_PORT || 4003;

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
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log('');
  console.log('Endpoints:');
  console.log(`  GET  /image/:path?w=800&h=800  - Get image/thumbnail`);
  console.log(`  GET  /image/sizes              - Get allowed sizes`);
  console.log(`  GET  /image/cache/stats        - Get cache stats`);
  console.log(`  DELETE /image/cache/clear      - Clear expired cache`);
  console.log(`  GET  /health                   - Health check`);
});

export default app;
