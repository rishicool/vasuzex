module.exports = {
  name: 'media-server',
  port: process.env.MEDIA_SERVER_PORT || 4003,
  env: process.env.NODE_ENV || 'development',
  debug: process.env.NODE_ENV !== 'production',
};
