/**
 * Application Configuration
 */

module.exports = {
  name: process.env.APP_NAME || 'blog-api-api',
  port: process.env.APP_PORT || 3000,
  env: process.env.APP_ENV || 'development',
  debug: process.env.APP_DEBUG === 'true',
  
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'change-this-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
};
