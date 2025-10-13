/**
 * Image Analysis Routes
 * Handle image analysis and vision-to-speech endpoints
 */

const express = require('express');
const router = express.Router();

// Import controllers and middlewares
const analyzeController = require('../controllers/analyze.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');
const { validateImageAnalysis } = require('../middlewares/validation.middleware');
const { asyncHandler } = require('../middlewares/error.middleware');

/**
 * @route POST /api/analyze
 * @desc Analyze single image and convert to speech
 * @access Public (with optional authentication for tracking)
 */
router.post('/',
  authenticateToken,
  validateImageAnalysis,
  asyncHandler(analyzeController.analyzeImage)
);


module.exports = router;
