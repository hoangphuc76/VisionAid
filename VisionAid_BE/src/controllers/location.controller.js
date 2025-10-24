/**
 * Location Controller
 * Handles HTTP requests for location sharing via Firebase
 */

const firebaseService = require('../services/firebase.service');
const User = require('../models/user.model');
const logger = require('../config/logger');
const { ValidationError, NotFoundError } = require('../utils/errors');

class LocationController {
  /**
   * Update current user's location
   * PUT /api/locations
   * body: { latitude, longitude }
   */
  async updateLocation(req, res, next) {
    try {
      const userId = req.user.id;
      const { latitude, longitude } = req.body;

      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        throw new ValidationError('latitude and longitude must be numbers');
      }

      if (latitude < -90 || latitude > 90) {
        throw new ValidationError('latitude must be between -90 and 90');
      }

      if (longitude < -180 || longitude > 180) {
        throw new ValidationError('longitude must be between -180 and 180');
      }

      await firebaseService.updateLocation(userId, latitude, longitude);

      // Emit to socket.io if available (handled in socket manager)
      if (req.app.get('io')) {
        req.app.get('io').to(`user:${userId}`).emit('location:updated', {
          userId,
          latitude,
          longitude,
          timestamp: Date.now()
        });

        // Also emit to family members
        const user = await User.findById(userId).select('userFamily');
        if (user && user.userFamily && user.userFamily.length > 0) {
          user.userFamily.forEach(familyId => {
            req.app.get('io').to(`user:${familyId}`).emit('family:location:updated', {
              userId,
              latitude,
              longitude,
              timestamp: Date.now()
            });
          });
        }
      }

      res.status(200).json({
        success: true,
        message: 'Location updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user's location
   * GET /api/locations/me
   */
  async getMyLocation(req, res, next) {
    try {
      const userId = req.user.id;
      const location = await firebaseService.getLocation(userId);

      res.status(200).json({
        success: true,
        location
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get family members' locations
   * GET /api/locations/family
   */
  async getFamilyLocations(req, res, next) {
    try {
      const userId = req.user.id;

      // Get user's family list
      const user = await User.findById(userId).select('userFamily');
      if (!user) {
        throw new NotFoundError('User not found');
      }

      const familyIds = (user.userFamily || []).map(String);

      if (familyIds.length === 0) {
        return res.status(200).json({
          success: true,
          locations: {}
        });
      }

      // Get all family members' locations
      const locations = await firebaseService.getMultipleLocations(familyIds);

      res.status(200).json({
        success: true,
        locations
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a specific user's location (must be family member)
   * GET /api/locations/:userId
   */
  async getUserLocation(req, res, next) {
    try {
      const currentUserId = req.user.id;
      const { userId } = req.params;

      // Check if the requested user is in current user's family
      const currentUser = await User.findById(currentUserId).select('userFamily');
      if (!currentUser) {
        throw new NotFoundError('User not found');
      }

      const familyIds = (currentUser.userFamily || []).map(String);
      
      // Allow users to get their own location or family members' locations
      if (userId !== currentUserId && !familyIds.includes(userId)) {
        throw new ValidationError('You can only view locations of your family members');
      }

      const location = await firebaseService.getLocation(userId);

      res.status(200).json({
        success: true,
        location
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove current user's location
   * DELETE /api/locations
   */
  async removeLocation(req, res, next) {
    try {
      const userId = req.user.id;
      await firebaseService.removeLocation(userId);

      // Emit to socket.io
      if (req.app.get('io')) {
        req.app.get('io').to(`user:${userId}`).emit('location:removed', { userId });
      }

      res.status(200).json({
        success: true,
        message: 'Location removed successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LocationController();
