/**
 * Validation Middleware
 * Request validation using Joi or custom validators
 */

const { ValidationError } = require('../utils/errors');

/**
 * Generic validation middleware
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req[property], {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        const messages = error.details.map(detail => detail.message);
        throw new ValidationError(messages.join(', '));
      }

      // Replace the property with validated and sanitized value
      req[property] = value;
      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Email validation
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Password strength validation
 */
const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return 'Password must contain at least one number';
  }
  
  return null; // Valid password
};

/**
 * MongoDB ObjectId validation
 */
const validateObjectId = (id) => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

/**
 * Custom validation middleware for user registration
 */
const validateUserRegistration = (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    // Validate email format
    if (!validateEmail(email)) {
      throw new ValidationError('Invalid email format');
    }

    // Validate password strength
    const passwordError = validatePassword(password);
    if (passwordError) {
      throw new ValidationError(passwordError);
    }

    // Normalize email
    req.body.email = email.toLowerCase().trim();

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Custom validation middleware for user login
 */
const validateUserLogin = (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    // Validate email format
    if (!validateEmail(email)) {
      throw new ValidationError('Invalid email format');
    }

    // Normalize email
    req.body.email = email.toLowerCase().trim();

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Custom validation middleware for image analysis
 */
const validateImageAnalysis = (req, res, next) => {
  try {
    const { image } = req.body;

    // Check required fields
    if (!image) {
      throw new ValidationError('Image data is required');
    }

    // Basic base64 format check
    if (typeof image !== 'string' || image.length === 0) {
      throw new ValidationError('Invalid image format');
    }

    // Check if it looks like base64
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Regex.test(image)) {
      throw new ValidationError('Image must be in base64 format');
    }

    // Check size (approximate, base64 is ~33% larger than binary)
    const sizeInBytes = (image.length * 3) / 4;
    const maxSizeInBytes = 10 * 1024 * 1024; // 10MB

    if (sizeInBytes > maxSizeInBytes) {
      throw new ValidationError('Image size exceeds 10MB limit');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Validate ObjectId parameter
 */
const validateObjectIdParam = (paramName = 'id') => {
  return (req, res, next) => {
    try {
      const id = req.params[paramName];
      
      if (!id) {
        throw new ValidationError(`${paramName} parameter is required`);
      }

      if (!validateObjectId(id)) {
        throw new ValidationError(`Invalid ${paramName} format`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Pagination validation middleware
 */
const validatePagination = (req, res, next) => {
  try {
    let { page = 1, limit = 10 } = req.query;

    // Convert to numbers
    page = parseInt(page);
    limit = parseInt(limit);

    // Validate values
    if (isNaN(page) || page < 1) {
      throw new ValidationError('Page must be a positive integer');
    }

    if (isNaN(limit) || limit < 1 || limit > 100) {
      throw new ValidationError('Limit must be between 1 and 100');
    }

    // Attach validated values to request
    req.pagination = { page, limit };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
