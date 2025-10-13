/**
 * Authentication Routes
 * Handle all authentication-related endpoints
 */

const express = require('express');
const router = express.Router();

// Import controllers and middlewares
const userController = require('../controllers/user.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { validateUserRegistration, validateUserLogin } = require('../middlewares/validation.middleware');
const { asyncHandler } = require('../middlewares/error.middleware');

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', 
  validateUserRegistration,
  asyncHandler(userController.register)
);

/**
 * @route POST /api/auth/login
 * @desc Login user
 * @access Public
 */
router.post('/login', 
  validateUserLogin,
  asyncHandler(userController.login)
);

/**
 * @route POST /api/auth/logout
 * @desc Logout user (optional endpoint for token cleanup)
 * @access Private
 */
router.post('/logout', 
  authenticateToken,
  asyncHandler(userController.logout)
);

/**
 * @route GET /api/auth/me
 * @desc Get current user profile
 * @access Private
 */
router.get('/me', 
  authenticateToken,
  asyncHandler(userController.getProfile)
);

/**
 * @route PUT /api/auth/change-password
 * @desc Change user password
 * @access Private
 */
router.put('/change-password', 
  authenticateToken,
  asyncHandler(userController.changePassword)
);

module.exports = router;
