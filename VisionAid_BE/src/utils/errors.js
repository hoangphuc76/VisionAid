/**
 * Custom Error Classes
 * Centralized error definitions for better error handling
 */

/**
 * Base API Error class
 */
class ApiError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Validation Error (400)
 */
class ValidationError extends ApiError {
  constructor(message = 'Validation failed') {
    super(message, 400);
  }
}

/**
 * Unauthorized Error (401)
 */
class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized access') {
    super(message, 401);
  }
}

/**
 * Forbidden Error (403)
 */
class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden access') {
    super(message, 403);
  }
}

/**
 * Not Found Error (404)
 */
class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

/**
 * Conflict Error (409)
 */
class ConflictError extends ApiError {
  constructor(message = 'Resource conflict') {
    super(message, 409);
  }
}

/**
 * Too Many Requests Error (429)
 */
class TooManyRequestsError extends ApiError {
  constructor(message = 'Too many requests') {
    super(message, 429);
  }
}

/**
 * Internal Server Error (500)
 */
class InternalServerError extends ApiError {
  constructor(message = 'Internal server error') {
    super(message, 500);
  }
}

/**
 * External Service Error (502)
 */
class ExternalServiceError extends ApiError {
  constructor(message = 'External service error') {
    super(message, 502);
  }
}

/**
 * Service Unavailable Error (503)
 */
class ServiceUnavailableError extends ApiError {
  constructor(message = 'Service unavailable') {
    super(message, 503);
  }
}

/**
 * Network Error
 */
class NetworkError extends ApiError {
  constructor(message = 'Network error') {
    super(message, 503);
  }
}

/**
 * Database Error
 */
class DatabaseError extends ApiError {
  constructor(message = 'Database operation failed') {
    super(message, 500);
  }
}

module.exports = {
  ApiError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  TooManyRequestsError,
  InternalServerError,
  ExternalServiceError,
  ServiceUnavailableError,
  NetworkError,
  DatabaseError,
};
