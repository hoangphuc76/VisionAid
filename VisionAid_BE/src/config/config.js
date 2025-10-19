/**
 * Environment Configuration
 * Centralized configuration for environment variables
 */

// Load environment-specific configuration
const { loadEnvironmentConfig, getEnvironmentInfo } = require('./env');
loadEnvironmentConfig();

const config = {
  // Server configuration
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database configuration (MongoDB)
  DB: {
    URI: process.env.MONGODB_URI,
    HOST: process.env.MONGODB_HOST || 'localhost',
    PORT: process.env.MONGODB_PORT || 27017,
    DATABASE: process.env.MONGODB_DATABASE || 'VisionAid',
    USERNAME: process.env.MONGODB_USERNAME,
    PASSWORD: process.env.MONGODB_PASSWORD,
    AUTH_SOURCE: process.env.MONGODB_AUTH_SOURCE || 'admin',
    OPTIONS: {
      maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE) || 10,
      serverSelectionTimeoutMS: parseInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT) || 5000,
      socketTimeoutMS: parseInt(process.env.MONGODB_SOCKET_TIMEOUT) || 45000,
    },
  },

  // JWT configuration
  JWT: {
    SECRET: process.env.JWT_SECRET || 'secretkey',
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
    REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'refreshsecretkey',
    REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // Rate limiting
  // RATE_LIMIT: {
  //   WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  //   MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  // },

  // CORS configuration
  CORS: {
    ORIGIN: process.env.CORS_ORIGIN || '*',
    METHODS: process.env.CORS_METHODS || 'GET,HEAD,PUT,PATCH,POST,DELETE',
    CREDENTIALS: process.env.CORS_CREDENTIALS === 'true' || false,
  },
};

module.exports = config;
