/**
 * Analyze Controller
 * Handles HTTP requests and responses for image analysis operations
 */

const analyzeService = require('../services/analyze.service');
const logger = require('../config/logger');
const { ValidationError } = require('../utils/errors');

class AnalyzeController {
  /**
   * Analyze single image
   * POST /api/analyze
   */
  async analyzeImage(req, res, next) {
    try {
      const { image, options = {} } = req.body;

      // Basic validation
      if (!image) {
        throw new ValidationError('Image data is required');
      }

      // Log analysis request (without image data for security)
      logger.info('Image analysis requested', {
        userId: req.user?.id || 'anonymous',
        imageSize: image.length,
        options,
      });

      const result = await analyzeService.analyzeImage(image, options);

      // Log successful analysis
      logger.info('Image analysis completed', {
        userId: req.user?.id || 'anonymous',
        textLength: result.text?.length || 0,
        hasAudio: !!result.audioUrl,
        processingTime: result.processingTime,
      });

      res.status(200).json(result);
    } catch (error) {
      logger.error('Image analysis failed', {
        userId: req.user?.id || 'anonymous',
        error: error.message,
      });
      next(error);
    }
  }

  /**
   * Analyze multiple images in batch
   * POST /api/analyze/batch
   */
  async batchAnalyze(req, res, next) {
    try {
      const { images, options = {} } = req.body;

      // Basic validation
      if (!images || !Array.isArray(images)) {
        throw new ValidationError('Images array is required');
      }

      if (images.length === 0) {
        throw new ValidationError('At least one image is required');
      }

      // Log batch analysis request
      logger.info('Batch image analysis requested', {
        userId: req.user?.id || 'anonymous',
        imageCount: images.length,
        options,
      });

      const result = await analyzeService.batchAnalyze(images, options);

      // Log batch analysis completion
      logger.info('Batch image analysis completed', {
        userId: req.user?.id || 'anonymous',
        totalImages: result.summary.total,
        successful: result.summary.successful,
        failed: result.summary.failed,
      });

      res.status(200).json(result);
    } catch (error) {
      logger.error('Batch image analysis failed', {
        userId: req.user?.id || 'anonymous',
        error: error.message,
      });
      next(error);
    }
  }

  /**
   * Get supported features
   * GET /api/analyze/features
   */
  async getFeatures(req, res, next) {
    try {
      const features = analyzeService.getFeatures();

      res.status(200).json({
        success: true,
        features,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Health check for analysis service
   * GET /api/analyze/health
   */
  async healthCheck(req, res, next) {
    try {
      const healthStatus = await analyzeService.healthCheck();

      const statusCode = healthStatus.healthy ? 200 : 503;

      res.status(statusCode).json({
        success: healthStatus.healthy,
        ...healthStatus,
      });
    } catch (error) {
      logger.error('Analyze service health check failed', {
        error: error.message,
      });
      next(error);
    }
  }

  /**
   * Legacy endpoint for backward compatibility
   * POST /analyze (matches original server.js endpoint)
   */
  async legacyAnalyze(req, res, next) {
    try {
      const { image } = req.body;

      if (!image) {
        throw new ValidationError('Image data is required');
      }

      logger.info('Legacy analyze endpoint called', {
        userId: req.user?.id || 'anonymous',
        imageSize: image.length,
      });

      const result = await analyzeService.analyzeImage(image);

      // Return in the format expected by the original API
      res.status(200).json({
        text: result.text,
        audioUrl: result.audioUrl,
      });
    } catch (error) {
      logger.error('Legacy analyze failed', {
        error: error.message,
      });
      
      // Return error in format expected by original API
      res.status(500).json({
        error: error.message,
      });
    }
  }

  /**
   * Get analysis statistics (for monitoring)
   * GET /api/analyze/stats
   */
  async getStats(req, res, next) {
    try {
      // This could be implemented with a database to track analysis statistics
      // For now, return basic service information
      const stats = {
        service: 'VisionAid Analysis API',
        version: '1.0.0',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        features: analyzeService.getFeatures(),
      };

      res.status(200).json({
        success: true,
        stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validate image format
   * POST /api/analyze/validate
   */
  async validateImage(req, res, next) {
    try {
      const { image } = req.body;

      if (!image) {
        throw new ValidationError('Image data is required');
      }

      const isValid = analyzeService.isValidBase64(image);

      res.status(200).json({
        success: true,
        valid: isValid,
        message: isValid ? 'Image format is valid' : 'Invalid image format',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AnalyzeController();
