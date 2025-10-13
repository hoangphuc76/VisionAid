/**
 * Analyze Service
 * Business logic for image analysis operations
 */

const fetch = require('node-fetch');
const config = require('../config/config');
const logger = require('../config/logger');
const { ValidationError, ExternalServiceError, NetworkError } = require('../utils/errors');

class AnalyzeService {
  constructor() {
    this.visionApiUrl = config.VISION_API.URL;
    this.timeout = config.VISION_API.TIMEOUT;
  }

  /**
   * Analyze image and convert to speech
   * @param {string} base64Image - Base64 encoded image
   * @param {Object} options - Analysis options
   * @returns {Object} Analysis result with text and audio URL
   */
  async analyzeImage(base64Image, options = {}) {
    try {
      // Validate input
      if (!base64Image) {
        throw new ValidationError('Image data is required');
      }

      if (!this.isValidBase64(base64Image)) {
        throw new ValidationError('Invalid base64 image format');
      }

      logger.info('Starting image analysis', { 
        imageSize: base64Image.length,
        options 
      });

      // Prepare request payload
      const requestPayload = {
        image: base64Image,
        ...options
      };

      // Call Vision API
      const result = await this.callVisionAPI(requestPayload);

      logger.info('Image analysis completed successfully', {
        textLength: result.text_result?.length || 0,
        audioUrl: result.audio_url
      });

      return {
        success: true,
        text: result.text_result || '',
        audioUrl: result.audio_url || null,
        processingTime: result.processing_time || null,
      };
    } catch (error) {
      logger.error('Image analysis failed:', error);
      throw error;
    }
  }

  /**
   * Call Vision API with retry mechanism
   * @param {Object} payload - Request payload
   * @returns {Object} API response
   */
  async callVisionAPI(payload, retryCount = 0) {
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second

    try {
      const response = await fetch(`${this.visionApiUrl}/upload_base64`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
        timeout: this.timeout,
      });

      if (!response.ok) {
        throw new ExternalServiceError(
          `Vision API returned status ${response.status}: ${response.statusText}`
        );
      }

      const result = await response.json();

      // Validate API response
      if (!result || typeof result !== 'object') {
        throw new ExternalServiceError('Invalid response format from Vision API');
      }

      return result;
    } catch (error) {
      logger.warn(`Vision API call failed (attempt ${retryCount + 1}):`, error);

      // Retry on network errors
      if (retryCount < maxRetries && this.isRetryableError(error)) {
        logger.info(`Retrying Vision API call in ${retryDelay}ms...`);
        await this.delay(retryDelay);
        return this.callVisionAPI(payload, retryCount + 1);
      }

      // Determine error type
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        throw new NetworkError('Vision API service is unavailable');
      }

      if (error.name === 'FetchError' || error.code === 'ETIMEDOUT') {
        throw new NetworkError('Vision API request timeout');
      }

      throw error;
    }
  }

  /**
   * Batch analyze multiple images
   * @param {Array} images - Array of base64 encoded images
   * @param {Object} options - Analysis options
   * @returns {Array} Array of analysis results
   */
  async batchAnalyze(images, options = {}) {
    try {
      if (!Array.isArray(images) || images.length === 0) {
        throw new ValidationError('Images array is required and cannot be empty');
      }

      if (images.length > 10) {
        throw new ValidationError('Maximum 10 images allowed per batch');
      }

      logger.info(`Starting batch analysis for ${images.length} images`);

      const results = [];
      const errors = [];

      // Process images concurrently with limit
      const concurrencyLimit = 3;
      for (let i = 0; i < images.length; i += concurrencyLimit) {
        const batch = images.slice(i, i + concurrencyLimit);
        const batchPromises = batch.map(async (image, index) => {
          try {
            const result = await this.analyzeImage(image, options);
            return { index: i + index, success: true, result };
          } catch (error) {
            return { index: i + index, success: false, error: error.message };
          }
        });

        const batchResults = await Promise.all(batchPromises);
        
        batchResults.forEach(({ index, success, result, error }) => {
          if (success) {
            results[index] = result;
          } else {
            errors[index] = error;
          }
        });
      }

      logger.info('Batch analysis completed', {
        totalImages: images.length,
        successful: results.filter(r => r).length,
        failed: errors.filter(e => e).length
      });

      return {
        success: true,
        results,
        errors,
        summary: {
          total: images.length,
          successful: results.filter(r => r).length,
          failed: errors.filter(e => e).length,
        }
      };
    } catch (error) {
      logger.error('Batch analysis failed:', error);
      throw error;
    }
  }

  /**
   * Get supported analysis features
   * @returns {Object} Supported features
   */
  getFeatures() {
    return {
      ocr: true,
      sceneDescription: true,
      objectDetection: true,
      textToSpeech: true,
      supportedImageFormats: ['jpg', 'jpeg', 'png', 'gif', 'bmp'],
      maxImageSize: 10 * 1024 * 1024, // 10MB
      maxBatchSize: 10,
    };
  }

  /**
   * Health check for Vision API
   * @returns {Object} Health status
   */
  async healthCheck() {
    try {
      const startTime = Date.now();
      
      // Simple ping to check if API is responsive
      const response = await fetch(`${this.visionApiUrl}/health`, {
        method: 'GET',
        timeout: 5000, // 5 second timeout for health check
      });

      const responseTime = Date.now() - startTime;
      const isHealthy = response.ok;

      logger.info('Vision API health check completed', {
        healthy: isHealthy,
        responseTime,
        status: response.status
      });

      return {
        healthy: isHealthy,
        responseTime,
        status: response.status,
        message: isHealthy ? 'Vision API is healthy' : 'Vision API is unhealthy',
      };
    } catch (error) {
      logger.error('Vision API health check failed:', error);
      return {
        healthy: false,
        responseTime: null,
        status: null,
        message: 'Vision API is unavailable',
        error: error.message,
      };
    }
  }

  /**
   * Validate base64 image format
   * @param {string} base64String - Base64 string to validate
   * @returns {boolean} Validation result
   */
  isValidBase64(base64String) {
    try {
      // Check if it's a valid base64 string
      const decoded = Buffer.from(base64String, 'base64');
      const encoded = decoded.toString('base64');
      
      // Basic validation
      return base64String === encoded && base64String.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if error is retryable
   * @param {Error} error - Error to check
   * @returns {boolean} Whether error is retryable
   */
  isRetryableError(error) {
    const retryableCodes = ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'EAI_AGAIN'];
    const retryableStatusCodes = [500, 502, 503, 504];
    
    return (
      retryableCodes.includes(error.code) ||
      retryableStatusCodes.includes(error.status) ||
      error.name === 'FetchError'
    );
  }

  /**
   * Delay utility for retry mechanism
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} Delay promise
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new AnalyzeService();
