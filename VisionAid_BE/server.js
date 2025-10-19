/**
 * VisionAid Backend Server
 * Main server entry point - only handles server startup and graceful shutdown
 */

// Load environment configuration first
const { loadEnvironmentConfig } = require('./src/config/env');
loadEnvironmentConfig();
const { initializeApp } = require('./src/app');
const config = require('./src/config/config');
const logger = require('./src/config/logger');
const { mongoose } = require('./src/config/database');
const { log } = require('winston');

/**
 * Start the server
 */
const startServer = async () => {
  try {
    // Initialize application with database connection
    const app = await initializeApp();

    // Start listening on specified port
    const PORT = config.PORT;
    const server = app.listen(PORT, () => {
      logger.info(`🚀 VisionAid Backend Server started successfully`);
      logger.info(` mongodb connected at ${mongoose.connection.host}:${mongoose.connection.port}/${mongoose.connection.name}`);
      logger.info(`📡 Server running on http://localhost:${PORT}`);
      logger.info(`🌍 Environment: ${config.NODE_ENV}`);
      logger.info(`📚 API Documentation: http://localhost:${PORT}/api/info`);
      logger.info(`❤️  Health Check: http://localhost:${PORT}/health`);
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`❌ Port ${PORT} is already in use`);
      } else {
        logger.error('❌ Server error:', error);
      }
      process.exit(1);
    });

    // Graceful shutdown handling
    const gracefulShutdown = (signal) => {
      logger.info(`📴 Received ${signal}. Starting graceful shutdown...`);

      server.close((error) => {
        if (error) {
          logger.error('❌ Error during server shutdown:', error);
          process.exit(1);
        }

        logger.info('✅ Server closed successfully');

        // Close database connection
        mongoose.connection.close((error) => {
          if (error) {
            logger.error('❌ Error closing database connection:', error);
            process.exit(1);
          }

          logger.info('✅ Database connection closed');
          logger.info('🎯 Graceful shutdown completed');
          process.exit(0);
        });
      });
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('� Uncaught Exception:', error);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

    return server;
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = { startServer };
