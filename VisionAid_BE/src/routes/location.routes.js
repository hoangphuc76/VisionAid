/**
 * Location Routes
 * Handle location sharing endpoints
 */

const express = require('express');
const router = express.Router();

const locationController = require('../controllers/location.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { asyncHandler } = require('../middlewares/error.middleware');

/**
 * @route PUT /api/locations
 * @desc Update current user's location
 * @access Private
 * @body { latitude: number, longitude: number }
 */
router.put('/', 
  authenticateToken,
  asyncHandler(locationController.updateLocation)
);

/**
 * @route GET /api/locations/me
 * @desc Get current user's location
 * @access Private
 */
router.get('/me', 
  authenticateToken,
  asyncHandler(locationController.getMyLocation)
);

/**
 * @route GET /api/locations/family
 * @desc Get all family members' locations
 * @access Private
 */
router.get('/family', 
  authenticateToken,
  asyncHandler(locationController.getFamilyLocations)
);

/**
 * @route GET /api/locations/:userId
 * @desc Get a specific user's location (must be family member)
 * @access Private
 */
router.get('/:userId', 
  authenticateToken,
  asyncHandler(locationController.getUserLocation)
);

/**
 * @route DELETE /api/locations
 * @desc Remove current user's location
 * @access Private
 */
router.delete('/', 
  authenticateToken,
  asyncHandler(locationController.removeLocation)
);

module.exports = router;
