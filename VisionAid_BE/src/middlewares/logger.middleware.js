/**
 * Request Logging Middleware
 * Logs HTTP requests using Winston
 */

const logger = require('../config/logger');

/**
 * HTTP request logging middleware
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log request start
  logger.info('HTTP Request', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id || 'anonymous',
    timestamp: new Date().toISOString(),
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - startTime;
    // Log response
    logger.info('HTTP Response', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userId: req.user?.id || 'anonymous',
      timestamp: new Date().toISOString(),
    });

    originalEnd.call(this, chunk, encoding);
  };

  next();
};

// /**
//  * Security headers middleware
//  */
// const securityHeaders = (req, res, next) => {
//   // Remove sensitive headers
//   res.removeHeader('X-Powered-By');
  
//   // Add security headers
//   res.setHeader('X-Content-Type-Options', 'nosniff');
//   res.setHeader('X-Frame-Options', 'DENY');
//   res.setHeader('X-XSS-Protection', '1; mode=block');
//   res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
//   // Only add HSTS in production
//   if (process.env.NODE_ENV === 'production') {
//     res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
//   }

//   next();
// };

/**
 * Request ID middleware
 * Adds unique request ID for tracking
 */
const requestId = (req, res, next) => {
  const id = Math.random().toString(36).substr(2, 9);
  req.requestId = id;
  res.setHeader('X-Request-ID', id);
  // Add request ID to logger context
  req.log = logger.child({ requestId: id });
  next();
};

// /**
//  * Request size limiter middleware
//  */
// const requestSizeLimit = (limit = '50mb') => {
//   return (req, res, next) => {
//     const contentLength = req.get('Content-Length');
    
//     if (contentLength) {
//       const sizeInBytes = parseInt(contentLength);
//       const limitInBytes = parseFloat(limit) * (limit.includes('mb') ? 1024 * 1024 : 1024);
      
//       if (sizeInBytes > limitInBytes) {
//         return res.status(413).json({
//           success: false,
//           error: `Request size exceeds limit of ${limit}`,
//           statusCode: 413,
//         });
//       }
//     }
    
//     next();
//   };
// };

module.exports = {
  requestLogger,
  requestId,
};
