/**
 * Middlewares Index
 * Central export point for all middleware functions
 */

// Authentication middlewares
const { 
  authenticateToken, 
  requireAdmin, 
  optionalAuth, 
  checkOwnership 
} = require('./auth.middleware');

// Error handling middlewares
const { 
  errorHandler, 
  notFoundHandler, 
  asyncHandler 
} = require('./error.middleware');

// Logging middlewares
const { 
  requestLogger, 
  securityHeaders, 
  requestId, 
  requestSizeLimit 
} = require('./logger.middleware');

// Validation middlewares
const { 
  validate,
  validateEmail,
  validatePassword,
  validateObjectId,
  validateUserRegistration,
  validateUserLogin,
  validateImageAnalysis,
  validateObjectIdParam,
  validatePagination 
} = require('./validation.middleware');

module.exports = {
  // Authentication
  authenticateToken,
  requireAdmin,
  optionalAuth,
  checkOwnership,
  
  // Error handling
  errorHandler,
  notFoundHandler,
  asyncHandler,
  
  // Logging & Security
  requestLogger,
  securityHeaders,
  requestId,
  requestSizeLimit,
  
  // Validation
  validate,
  validateEmail,
  validatePassword,
  validateObjectId,
  validateUserRegistration,
  validateUserLogin,
  validateImageAnalysis,
  validateObjectIdParam,
  validatePagination,
};
