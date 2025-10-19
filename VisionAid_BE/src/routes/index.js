/**
 * Routes Index
 * Central router that combines all route modules
 */

const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');

// Mount routes with appropriate prefixes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

// Health check endpoint for the entire API
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'VisionAid API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      analyze: '/api/analyze',
    },
  });
});

// API documentation endpoint (basic info)
router.get('/info', (req, res) => {
  res.status(200).json({
    success: true,
    api: {
      name: 'VisionAid Backend API',
      version: '1.0.0',
      description: 'API for VisionAid accessibility application',
      endpoints: {
        authentication: {
          prefix: '/api/auth',
          routes: [
            'POST /api/auth/register - Register new user',
            'POST /api/auth/login - Login user',
            'POST /api/auth/logout - Logout user',
            'GET /api/auth/me - Get current user profile',
            'PUT /api/auth/change-password - Change password',
          ],
        },
        users: {
          prefix: '/api/users',
          routes: [
            'GET /api/users - Get all users (Admin)',
            'GET /api/users/:id - Get user by ID (Admin)',
            'PUT /api/users/profile - Update profile',
            'DELETE /api/users/:id - Deactivate user (Admin)',
            'GET /api/users/stats - Get user statistics (Admin)',
          ],
        },
        analysis: {
          prefix: '/api/analyze',
          routes: [
            'POST /api/analyze - Analyze single image',
            'POST /api/analyze/batch - Batch analyze images',
            'GET /api/analyze/features - Get supported features',
            'GET /api/analyze/health - Health check',
            'POST /api/analyze/validate - Validate image format',
            'GET /api/analyze/stats - Get analysis statistics',
          ],
        },
      },
    },
  });
});



module.exports = router;
