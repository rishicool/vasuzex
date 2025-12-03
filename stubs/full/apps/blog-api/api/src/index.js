/**
 * Blog-api API Application
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
  console.log(`🚀 ${process.env.APP_NAME || 'blog-api-api'} started on port ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
});

export default app;
