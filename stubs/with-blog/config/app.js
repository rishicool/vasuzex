export default {
  name: process.env.APP_NAME || 'Vasuzex App',
  env: process.env.NODE_ENV || 'development',
  debug: process.env.APP_DEBUG === 'true',
  url: process.env.APP_URL || 'http://localhost:3000',
  port: parseInt(process.env.PORT || '3000', 10),
  timezone: process.env.APP_TIMEZONE || 'UTC',
  locale: process.env.APP_LOCALE || 'en',
  
  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  },
  
  // API Configuration
  api: {
    prefix: process.env.API_PREFIX || '/api',
    version: process.env.API_VERSION || 'v1'
  }
};
