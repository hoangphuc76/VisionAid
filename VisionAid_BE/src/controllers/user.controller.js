/**
 * User Controller
 * Handles HTTP requests and responses for user operations
 */

const userService = require('../services/user.service');
const logger = require('../config/logger');
const { ValidationError } = require('../utils/errors');

class UserController {
  /**
   * Register a new user
   * POST /api/users/register
   */
  async register(req, res, next) {
    try {
      const { email, password } = req.body;

      // Basic validation
      if (!email || !password) {
        throw new ValidationError('Email and password are required');
      }

      const result = await userService.register({ email, password });

      logger.info('User registration successful', { 
        email, 
        userId: result.user.id 
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * User login
   * POST /api/users/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      // Basic validation
      if (!email || !password) {
        throw new ValidationError('Email and password are required');
      }

      const result = await userService.login({ email, password });

      logger.info('User login successful', { 
        email, 
        userId: result.user.id,
        accessToken: result.token
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user profile
   * GET /api/users/profile
   */
  async getProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const profile = await userService.getProfile(userId);

      res.status(200).json({
        success: true,
        user: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user profile
   * PUT /api/users/profile
   */
  async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const updateData = req.body;

      const updatedProfile = await userService.updateProfile(userId, updateData);

      logger.info('User profile updated', { userId });

      res.status(200).json({
        success: true,
        user: updatedProfile,
        message: 'Profile updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change user password
   * PUT /api/users/change-password
   */
  async changePassword(req, res, next) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      // Basic validation
      if (!currentPassword || !newPassword) {
        throw new ValidationError('Current password and new password are required');
      }

      const result = await userService.changePassword(userId, currentPassword, newPassword);

      logger.info('Password changed successfully', { userId });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all users (Admin only)
   * GET /api/users
   */
  async getAllUsers(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;

      const result = await userService.getAllUsers(page, limit);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deactivate user (Admin only)
   * DELETE /api/users/:id
   */
  async deactivateUser(req, res, next) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        throw new ValidationError('Valid user ID is required');
      }

      const result = await userService.deactivateUser(parseInt(id));

      logger.info('User deactivated', { 
        deactivatedUserId: id, 
        adminId: req.user.id 
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user by ID (Admin only)
   * GET /api/users/:id
   */
  async getUserById(req, res, next) {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        throw new ValidationError('Valid user ID is required');
      }

      const user = await userService.getProfile(parseInt(id));

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user (Optional: for token blacklisting)
   * POST /api/users/logout
   */
  async logout(req, res, next) {
    try {
      // In a simple JWT implementation, logout is handled on the client side
      // For enhanced security, you might want to implement token blacklisting here
      
      logger.info('User logged out', { userId: req.user.id });

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
