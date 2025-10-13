/**
 * Express Application Configuration
 * Main app setup with middleware configuration and route mounting
 */

const express = require('express');
const cors = require('cors');
// const helmet = require('helmet');
// const rateLimit = require('express-rate-limit');

// Import configurations
const config = require('./config/config');
const logger = require('./config/logger');
const { connectDB } = require('./config/database');

// Import routes
const routes = require('./routes');

// Import middlewares
const { errorHandler, notFoundHandler } = require('./middlewares/error.middleware');
const { requestLogger, securityHeaders, requestId } = require('./middlewares/logger.middleware');

/**
 * Create Express application
 */
const createApp = () => {
  const app = express();


  app.set('trust proxy', 1);

//   app.use(helmet({
//     crossOriginResourcePolicy: { policy: "cross-origin" },
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'"],
//         styleSrc: ["'self'", "'unsafe-inline'"],
//         scriptSrc: ["'self'"],
//         imgSrc: ["'self'", "data:", "https:"],
//       },
//     },
//   }));

//   // Custom security headers
//   app.use(securityHeaders);

  // Request ID middleware

  app.use(requestId);

  // Request logging middleware
  app.use(requestLogger);

  // CORS configuration
  app.use(cors({
    origin: config.CORS.ORIGIN,
    methods: config.CORS.METHODS,
    credentials: config.CORS.CREDENTIALS,
    optionsSuccessStatus: 200, // For legacy browser support
  }));

//   // Rate limiting middleware
//   const limiter = rateLimit({
//     windowMs: config.RATE_LIMIT.WINDOW_MS,
//     max: config.RATE_LIMIT.MAX_REQUESTS,
//     message: {
//       success: false,
//       error: 'Too many requests from this IP, please try again later',
//       statusCode: 429,
//     },
//     standardHeaders: true, // Return rate limit info in headers
//     legacyHeaders: false,  // Disable X-RateLimit-* headers
//     skip: (req) => {
//       // Skip rate limiting for health checks
//       return req.path === '/api/health' || req.path === '/health';
//     },
//   });

//   app.use(limiter);


  app.use(express.json({
    limit: '50mb',
    verify: (req, res, buf, encoding) => {
      if (buf && buf.length) {
        req.rawBody = buf;
      }
    }
  }));

  app.use(express.urlencoded({
    limit: '50mb',
    extended: true,
    parameterLimit: 1000,
  }));

  app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
      logger.warn('Invalid JSON payload:', {
        error: error.message,
        url: req.url,
        method: req.method
      });
      return res.status(400).json({
        success: false,
        error: 'Invalid JSON payload',
        statusCode: 400,
      });
    }
    next(error);
  });

  app.use('/api', routes);

  // Root endpoint
  app.get('/', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'VisionAid Backend API',
      version: '1.0.0',
      documentation: '/api/info',
      health: '/api/health',
      timestamp: new Date().toISOString(),
    });
  });

  // Health check endpoint at root level
  app.get('/health', (req, res) => {
    res.status(200).json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: '1.0.0',
    });
  });

  // 404 handler for undefined routes
    app.use((req, res) => {
    notFoundHandler(req, res);
    });

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
};

/**
 * Initialize application with database connection
 */
const initializeApp = async () => {
  try {
    // Connect to database
    await connectDB();
    logger.info('Database connection established');

    // Create Express app
    const app = createApp();

    logger.info('Express application initialized successfully');
    return app;
  } catch (error) {
    logger.error('Failed to initialize application:', error);
    process.exit(1);
  }
};

module.exports = {
  createApp,
  initializeApp,
};
