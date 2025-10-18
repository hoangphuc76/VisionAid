/**
 * User Service
 * Business logic for user-related operations
 */

const jwt = require('jsonwebtoken');
const User = require('../models/user.model.js');
const config = require('../config/config');
const logger = require('../config/logger');
const { ValidationError, NotFoundError, ConflictError, UnauthorizedError } = require('../utils/errors');

class UserService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @returns {Object} User data and token
   */
  async register(userData) {
    try {
      const { email, password } = userData;

      console.log('Registering user with email:', email);

      // Validate input
      if (!email || !password) {
        throw new ValidationError('Email and password are required');
      }

      if (password.length < 8) {
        throw new ValidationError('Password must be at least 8 characters long');
      }

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        throw new ConflictError('Email already exists');
      }

      // Create new user
      const user = new User({
        email: email.toLowerCase(),
        password_hash: password, // Will be hashed by the pre-save middleware
      });

      await user.save();

      logger.info(`New user registered: ${email}`, { userId: user._id });

      // Generate JWT token
      const token = this.generateToken(user);

      return {
        success: true,
        user: user.getProfile(),
        token,
      };
    } catch (error) {
      // Handle MongoDB validation errors
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        throw new ValidationError(messages.join(', '));
      }
      
      // Handle duplicate key error
      if (error.code === 11000) {
        throw new ConflictError('Email already exists');
      }

      logger.error('User registration failed:', error);
      throw error;
    }
  }

  /**
   * Authenticate user login
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Object} User data and token
   */
  async login(credentials) {
    try {
      const { email, password } = credentials;

      // Validate input
      if (!email || !password) {
        throw new ValidationError('Email and password are required');
      }

      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Validate password
      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        throw new UnauthorizedError('Invalid password');
      }

      // Update last login
      await user.updateLastLogin();

      logger.info(`User logged in: ${email}`, { userId: user.id });

      // Generate JWT token
      const token = this.generateToken(user);

      return {
        success: true,
        user: user.getProfile(),
        accessToken: token,
      };
    } catch (error) {
      logger.error('User login failed:', error);
      throw error;
    }
  }

  /**
   * Get user profile by ID
   * @param {string} userId - User ID (MongoDB ObjectId)
   * @returns {Object} User profile data
   */
  async getProfile(userId) {
    try {
      const user = await User.findActiveById(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      return user.getProfile();
    } catch (error) {
      // Handle invalid ObjectId
      if (error.name === 'CastError') {
        throw new ValidationError('Invalid user ID format');
      }
      
      logger.error('Get user profile failed:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User ID (MongoDB ObjectId)
   * @param {Object} updateData - Data to update
   * @returns {Object} Updated user profile
   */
  async updateProfile(userId, updateData) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.is_active) {
        throw new NotFoundError('User not found');
      }

      // Only allow certain fields to be updated
      const allowedFields = ['email'];
      const filteredData = {};
      
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          filteredData[field] = updateData[field];
        }
      });

      if (Object.keys(filteredData).length === 0) {
        throw new ValidationError('No valid fields provided for update');
      }

      // Check if new email already exists (if email is being updated)
      if (filteredData.email && filteredData.email.toLowerCase() !== user.email) {
        const existingUser = await User.findByEmail(filteredData.email);
        if (existingUser && existingUser._id.toString() !== userId) {
          throw new ConflictError('Email already exists');
        }
      }

      // Update user fields
      Object.assign(user, filteredData);
      await user.save();

      logger.info(`User profile updated: ${user.email}`, { userId });

      return user.getProfile();
    } catch (error) {
      // Handle MongoDB validation errors
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        throw new ValidationError(messages.join(', '));
      }
      
      // Handle duplicate key error
      if (error.code === 11000) {
        throw new ConflictError('Email already exists');
      }

      // Handle invalid ObjectId
      if (error.name === 'CastError') {
        throw new ValidationError('Invalid user ID format');
      }

      logger.error('Update user profile failed:', error);
      throw error;
    }
  }

  /**
   * Change user password
   * @param {string} userId - User ID (MongoDB ObjectId)
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {boolean} Success status
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      // Validate input
      if (!currentPassword || !newPassword) {
        throw new ValidationError('Current password and new password are required');
      }

      if (newPassword.length < 8) {
        throw new ValidationError('New password must be at least 8 characters long');
      }

      const user = await User.findById(userId);
      if (!user || !user.is_active) {
        throw new NotFoundError('User not found');
      }

      // Validate current password
      const isValidPassword = await user.validatePassword(currentPassword);
      if (!isValidPassword) {
        throw new UnauthorizedError('Current password is incorrect');
      }

      // Update password
      user.password_hash = newPassword; // Will be hashed by pre-save middleware
      await user.save();

      logger.info(`Password changed for user: ${user.email}`, { userId });

      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      // Handle MongoDB validation errors
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        throw new ValidationError(messages.join(', '));
      }

      // Handle invalid ObjectId
      if (error.name === 'CastError') {
        throw new ValidationError('Invalid user ID format');
      }

      logger.error('Change password failed:', error);
      throw error;
    }
  }

  /**
   * Get all users (admin only)
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Object} Paginated users list
   */
  async getAllUsers(page = 1, limit = 10) {
    try {
      const result = await User.findActiveUsers(page, limit);
      
      return {
        users: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: result.count,
          totalPages: Math.ceil(result.count / limit),
        },
      };
    } catch (error) {
      logger.error('Get all users failed:', error);
      throw error;
    }
  }

  /**
   * Deactivate user account
   * @param {string} userId - User ID (MongoDB ObjectId)
   * @returns {boolean} Success status
   */
  async deactivateUser(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      await user.deactivate();

      logger.info(`User deactivated: ${user.email}`, { userId });

      return { success: true, message: 'User deactivated successfully' };
    } catch (error) {
      // Handle invalid ObjectId
      if (error.name === 'CastError') {
        throw new ValidationError('Invalid user ID format');
      }

      logger.error('Deactivate user failed:', error);
      throw error;
    }
  }

  /**
   * Generate JWT token for user
   * @param {Object} user - User object (Mongoose document)
   * @returns {string} JWT token
   */
  generateToken(user) {
    return jwt.sign(
      { 
        id: user._id.toString(), 
        email: user.email,
        role: user.role 
      },
      config.JWT.SECRET,
      { expiresIn: config.JWT.EXPIRES_IN }
    );
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Object} Decoded token data
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, config.JWT.SECRET);
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }
}

module.exports = new UserService();
