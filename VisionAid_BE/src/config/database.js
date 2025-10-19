/**
 * Database Configuration
 * Mongoose configuration for MongoDB connection
 */

const mongoose = require('mongoose');
const logger = require('./logger');
const config = require('./config');

// MongoDB connection configuration
const connectDB = async () => {
  try {
    // Use centralized config instead of direct process.env access
    const connectionString = config.DB.URI ||
      `mongodb://${config.DB.HOST}:${config.DB.PORT}/${config.DB.DATABASE}`;

    const options = {
      maxPoolSize: config.DB.OPTIONS.maxPoolSize,
      serverSelectionTimeoutMS: config.DB.OPTIONS.serverSelectionTimeoutMS,
      socketTimeoutMS: config.DB.OPTIONS.socketTimeoutMS,
    };

    // Add authentication if credentials are provided in config
    if (config.DB.USERNAME && config.DB.PASSWORD) {
      options.auth = {
        username: config.DB.USERNAME,
        password: config.DB.PASSWORD,
      };
      options.authSource = config.DB.AUTH_SOURCE;
    }

    await mongoose.connect(connectionString, options);

    logger.info('✅ MongoDB connected successfully');

    // Connection event listeners
    mongoose.connection.on('error', (error) => {
      logger.error('❌ MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('🔄 MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('📴 MongoDB connection closed through app termination');
      process.exit(0);
    });

    return mongoose.connection;
  } catch (error) {
    logger.error('❌ Unable to connect to MongoDB:', error);
    process.exit(1);
  }
};

/**
 * Test database connection
 */
const testConnection = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      logger.info('✅ MongoDB connection is active');
      return true;
    } else {
      await connectDB();
      return true;
    }
  } catch (error) {
    logger.error('❌ Unable to connect to MongoDB:', error);
    return false;
  }
};

/**
 * Initialize database (for future use with indexes, etc.)
 */
const initializeDatabase = async () => {
  try {
    // Create indexes if needed
    // This will be handled by individual models
    logger.info('✅ Database initialization completed');
  } catch (error) {
    logger.error('❌ Database initialization failed:', error);
    throw error;
  }
};

/**
 * Get connection status
 */
const getConnectionStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  
  return {
    state: states[mongoose.connection.readyState],
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name,
  };
};

module.exports = {
  connectDB,
  testConnection,
  initializeDatabase,
  getConnectionStatus,
  mongoose,
};
