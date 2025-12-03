/**
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
