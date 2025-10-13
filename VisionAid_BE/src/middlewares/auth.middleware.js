/**
 * Authentication Middleware
 * JWT token validation and user authentication
 */

const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const config = require('../config/config');
const logger = require('../config/logger');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');

/**
 * Middleware to authenticate JWT token
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw new UnauthorizedError('Access token is required');
    }

    // Verify JWT token
    const decoded = jwt.verify(token, config.JWT.SECRET);

    // Find user by ID from token
    const user = await User.findActiveById(decoded.id);
    if (!user) {
      throw new UnauthorizedError('User not found or inactive');
    }

    // Attach user to request object
    req.user = user.toObject();
    req.token = token;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new UnauthorizedError('Invalid token'));
    }

    if (error.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Token expired'));
    }

    next(error);
  }
};

/**
 * Middleware to check if user has admin role
 */
const requireAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (req.user.role !== 'admin') {
      throw new ForbiddenError('Admin access required');
    }

    next();
  } catch (error) {
    next(error);
  }
};

// /**
//  * Optional authentication middleware (doesn't fail if no token)
//  */
// const optionalAuth = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;
//     const token = authHeader && authHeader.split(' ')[1];

//     if (token) {
//       const decoded = jwt.verify(token, config.JWT.SECRET);
//       const user = await User.findActiveById(decoded.id);

//       if (user) {
//         req.user = user.toObject();
//         req.token = token;
//       }
//     }

//     next();
//   } catch (error) {
//     // Log the error but continue without authentication
//     logger.warn('Optional auth failed:', error.message);
//     next();
//   }
// };

// /**
//  * Middleware to check resource ownership
//  */
// const checkOwnership = (resourceUserIdField = 'userId') => {
//   return (req, res, next) => {
//     try {
//       if (!req.user) {
//         throw new UnauthorizedError('Authentication required');
//       }

//       const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];

//       // Admin can access any resource
//       if (req.user.role === 'admin') {
//         return next();
//       }

//       // User can only access their own resources
//       if (req.user.id !== resourceUserId) {
//         throw new ForbiddenError('Access denied: insufficient permissions');
//       }

//       next();
//     } catch (error) {
//       next(error);
//     }
//   };
// };

module.exports = {
  authenticateToken,
  requireAdmin,
};
