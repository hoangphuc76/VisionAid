/**
 * User Management Routes
 * Handle user management endpoints (admin functions)
 */

const express = require('express');
const router = express.Router();

// Import controllers and middlewares
const userController = require('../controllers/user.controller');
const { authenticateToken, requireAdmin } = require('../middlewares/auth.middleware');
const { validateObjectIdParam, validatePagination } = require('../middlewares/validation.middleware');
const { asyncHandler } = require('../middlewares/error.middleware');
const User = require('../models/user.model');

/**
 * @route GET /api/users
 * @desc Get all users with pagination (Admin only)
 * @access Private (Admin)
 * @query page - Page number (default: 1)
 * @query limit - Items per page (default: 10, max: 100)
 */
router.get('/', 
  authenticateToken,
  requireAdmin,
  validatePagination,
  asyncHandler(userController.getAllUsers)
);

/**
 * @route GET /api/users/:id
 * @desc Get user by ID (Admin only)
 * @access Private (Admin)
 */
router.get('/:id', 
  authenticateToken,
  requireAdmin,
  validateObjectIdParam('id'),
  asyncHandler(userController.getUserById)
);

/**
 * @route PUT /api/users/profile
 * @desc Update current user profile
 * @access Private
 */
router.put('/profile', 
  authenticateToken,
  asyncHandler(userController.updateProfile)
);

/**
 * @route DELETE /api/users/:id
 * @desc Deactivate user account (Admin only)
 * @access Private (Admin)
 */
router.delete('/:id', 
  authenticateToken,
  requireAdmin,
  validateObjectIdParam('id'),
  asyncHandler(userController.deactivateUser)
);

/**
 * @route GET /api/users/stats
 * @desc Get user statistics (Admin only)
 * @access Private (Admin)
 */
router.get('/stats', 
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res, next) => {
    try {
      const stats = await User.getStats();
      
      res.status(200).json({
        success: true,
        stats,
      });
    } catch (error) {
      next(error);
    }
  })
);

module.exports = router;
