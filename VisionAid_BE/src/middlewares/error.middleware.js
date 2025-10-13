/**
 * Error Handling Middleware
 * Centralized error handling for the application
 */

const logger = require('../config/logger');
const { ApiError } = require('../utils/errors');

/**
 * Error handler middleware
 */
const errorHandler = (error, req, res, next) => {
  // Log error details
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id || 'anonymous',
  });

  // Handle known API errors
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.message,
      statusCode: error.statusCode,
    });
  }

  // Handle Mongoose validation errors
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: messages,
      statusCode: 400,
    });
  }

  // Handle Mongoose cast errors (invalid ObjectId)
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid resource ID format',
      statusCode: 400,
    });
  }

  // Handle MongoDB duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    const value = error.keyValue[field];
    return res.status(409).json({
      success: false,
      error: `${field} '${value}' already exists`,
      statusCode: 409,
    });
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      statusCode: 401,
    });
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired',
      statusCode: 401,
    });
  }

  // Handle rate limiting errors
  if (error.status === 429) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests, please try again later',
      statusCode: 429,
      retryAfter: error.retryAfter,
    });
  }

  // Handle unexpected errors
  const statusCode = error.statusCode || error.status || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : error.message;

  res.status(statusCode).json({
    success: false,
    error: message,
    statusCode,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;

  logger.warn('Route not found:', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
    statusCode: 404,
  });
};

/**
 * Async error wrapper
 * Catches async errors and passes them to error handler
 */

//Thay vi try-catch moi function, thi dung function nay de tu dong bat
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
};
