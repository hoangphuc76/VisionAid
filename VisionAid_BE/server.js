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
const firebaseService = require('./src/services/firebase.service');
const http = require('http');
const { Server } = require('socket.io');

/**
 * Start the server
 */
const startServer = async () => {
  try {
    // Initialize application with database connection
    const app = await initializeApp();

    // Initialize Firebase Admin SDK
    try {
      firebaseService.initialize();
    } catch (error) {
      logger.warn('Firebase initialization failed - location features disabled');
    }

    // Create HTTP server
    const PORT = config.PORT;
    const HOST = config.HOST || process.env.HOST || '0.0.0.0';
    const server = http.createServer(app);

    // Setup Socket.IO
    const io = new Server(server, {
      cors: {
        origin: config.CORS.ORIGIN,
        methods: ['GET', 'POST'],
        credentials: config.CORS.CREDENTIALS
      }
    });

    // Store io instance in app for use in controllers
    app.set('io', io);

    // Socket.IO connection handling
    io.on('connection', (socket) => {
      logger.info(`Socket connected: ${socket.id}`);

      // Join user-specific room
      socket.on('join', (userId) => {
        socket.join(`user:${userId}`);
        logger.info(`User ${userId} joined room`);
      });

      // Leave room
      socket.on('leave', (userId) => {
        socket.leave(`user:${userId}`);
        logger.info(`User ${userId} left room`);
      });

      socket.on('disconnect', () => {
        logger.info(`Socket disconnected: ${socket.id}`);
      });
    });

    // Start listening on specified port
    server.listen(PORT, HOST, () => {
      logger.info(`🚀 VisionAid Backend Server started successfully`);
      logger.info(` mongodb connected at ${mongoose.connection.host}:${mongoose.connection.port}/${mongoose.connection.name}`);
      logger.info(`📡 Server running on http://${HOST}:${PORT}`);
      logger.info(`🌍 Environment: ${config.NODE_ENV}`);
      logger.info(`📚 API Documentation: http://${HOST}:${PORT}/api/info`);
      logger.info(`❤️  Health Check: http://${HOST}:${PORT}/health`);
    });

    // Log LAN IPs for easy access from phone
    const os = require('os');
    const nics = os.networkInterfaces();
    Object.values(nics).flat().forEach(i => {
      if (i && i.family === 'IPv4' && !i.address.startsWith('127.')) {
        logger.info(`→ LAN: http://${i.address}:${PORT}`);
      }
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
