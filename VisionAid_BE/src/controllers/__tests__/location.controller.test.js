/**
 * Unit Tests for Location Controller
 * Test Coverage: All 5 controller methods with 15+ test cases
 * Target Coverage: >80%
 * 
 * Test Strategy:
 * - Normal/happy paths
 * - Validation errors (boundary conditions, type errors)
 * - Authorization/permission errors
 * - Database errors
 * - Socket.IO integration
 * - Edge cases (null, empty, large values)
 */

const LocationController = require('../location.controller');
const firebaseService = require('../../services/firebase.service');
const User = require('../../models/user.model');
const { ValidationError, NotFoundError } = require('../../utils/errors');

// Mock dependencies
jest.mock('../../services/firebase.service');
jest.mock('../../models/user.model');
jest.mock('../../config/logger');

describe('LocationController', () => {
  let req, res, next;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Setup common request/response/next mocks
    req = {
      user: { id: 'user123' },
      body: {},
      params: {},
      app: {
        get: jest.fn()
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    next = jest.fn();
  });

  describe('updateLocation', () => {
    // TEST 1: Happy path - successful location update
    test('should update location successfully with valid coordinates', async () => {
      req.body = { latitude: 10.762622, longitude: 106.660172 };
      firebaseService.updateLocation.mockResolvedValue(true);

      await LocationController.updateLocation(req, res, next);

      expect(firebaseService.updateLocation).toHaveBeenCalledWith('user123', 10.762622, 106.660172);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Location updated successfully'
      });
      expect(next).not.toHaveBeenCalled();
    });

    // TEST 2: Validation error - latitude not a number
    test('should reject non-numeric latitude', async () => {
      req.body = { latitude: '10.76', longitude: 106.66 };

      await LocationController.updateLocation(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
      expect(next.mock.calls[0][0].message).toBe('latitude and longitude must be numbers');
      expect(firebaseService.updateLocation).not.toHaveBeenCalled();
    });

    // TEST 3: Validation error - longitude not a number
    test('should reject non-numeric longitude', async () => {
      req.body = { latitude: 10.76, longitude: '106.66' };

      await LocationController.updateLocation(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
      expect(firebaseService.updateLocation).not.toHaveBeenCalled();
    });

    // TEST 4: Boundary validation - latitude too high
    test('should reject latitude > 90', async () => {
      req.body = { latitude: 91, longitude: 100 };

      await LocationController.updateLocation(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
      expect(next.mock.calls[0][0].message).toBe('latitude must be between -90 and 90');
    });

    // TEST 5: Boundary validation - latitude too low
    test('should reject latitude < -90', async () => {
      req.body = { latitude: -91, longitude: 100 };

      await LocationController.updateLocation(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
      expect(next.mock.calls[0][0].message).toBe('latitude must be between -90 and 90');
    });

    // TEST 6: Boundary validation - longitude too high
    test('should reject longitude > 180', async () => {
      req.body = { latitude: 50, longitude: 181 };

      await LocationController.updateLocation(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
      expect(next.mock.calls[0][0].message).toBe('longitude must be between -180 and 180');
    });

    // TEST 7: Boundary validation - longitude too low
    test('should reject longitude < -180', async () => {
      req.body = { latitude: 50, longitude: -181 };

      await LocationController.updateLocation(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    // TEST 8: Edge case - boundary values (max valid)
    test('should accept latitude = 90 and longitude = 180', async () => {
      req.body = { latitude: 90, longitude: 180 };
      firebaseService.updateLocation.mockResolvedValue(true);

      await LocationController.updateLocation(req, res, next);

      expect(firebaseService.updateLocation).toHaveBeenCalledWith('user123', 90, 180);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    // TEST 9: Edge case - boundary values (min valid)
    test('should accept latitude = -90 and longitude = -180', async () => {
      req.body = { latitude: -90, longitude: -180 };
      firebaseService.updateLocation.mockResolvedValue(true);

      await LocationController.updateLocation(req, res, next);

      expect(firebaseService.updateLocation).toHaveBeenCalledWith('user123', -90, -180);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    // TEST 10: Socket.IO integration - emit to user and family
    test('should emit location updates via Socket.IO when available', async () => {
      const mockIo = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn()
      };
      req.app.get.mockReturnValue(mockIo);
      req.body = { latitude: 10.5, longitude: 106.5 };
      
      const mockUser = {
        userFamily: ['family1', 'family2']
      };
      User.findById.mockResolvedValue(mockUser);
      firebaseService.updateLocation.mockResolvedValue(true);

      await LocationController.updateLocation(req, res, next);

      expect(mockIo.to).toHaveBeenCalledWith('user:user123');
      expect(mockIo.emit).toHaveBeenCalledWith('location:updated', expect.objectContaining({
        userId: 'user123',
        latitude: 10.5,
        longitude: 106.5
      }));
      expect(mockIo.to).toHaveBeenCalledWith('user:family1');
      expect(mockIo.to).toHaveBeenCalledWith('user:family2');
    });

    // TEST 11: Socket.IO - handle when no family members
    test('should handle location update when user has no family', async () => {
      const mockIo = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn()
      };
      req.app.get.mockReturnValue(mockIo);
      req.body = { latitude: 10.5, longitude: 106.5 };
      
      const mockUser = { userFamily: [] };
      User.findById.mockResolvedValue(mockUser);
      firebaseService.updateLocation.mockResolvedValue(true);

      await LocationController.updateLocation(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      // Should only emit to user, not family
      expect(mockIo.to).toHaveBeenCalledTimes(1);
    });

    // TEST 12: Error handling - Firebase service failure
    test('should handle Firebase service errors', async () => {
      req.body = { latitude: 10.5, longitude: 106.5 };
      const firebaseError = new Error('Firebase connection failed');
      firebaseService.updateLocation.mockRejectedValue(firebaseError);

      await LocationController.updateLocation(req, res, next);

      expect(next).toHaveBeenCalledWith(firebaseError);
      expect(res.status).not.toHaveBeenCalled();
    });

    // TEST 13: Edge case - zero coordinates
    test('should accept zero coordinates (equator/prime meridian)', async () => {
      req.body = { latitude: 0, longitude: 0 };
      firebaseService.updateLocation.mockResolvedValue(true);

      await LocationController.updateLocation(req, res, next);

      expect(firebaseService.updateLocation).toHaveBeenCalledWith('user123', 0, 0);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    // TEST 14: Validation - missing latitude
    test('should reject when latitude is missing', async () => {
      req.body = { longitude: 106.5 };

      await LocationController.updateLocation(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    // TEST 15: Validation - missing longitude
    test('should reject when longitude is missing', async () => {
      req.body = { latitude: 10.5 };

      await LocationController.updateLocation(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });
  });

  describe('getMyLocation', () => {
    // TEST 16: Happy path - get own location successfully
    test('should return user location when it exists', async () => {
      const mockLocation = {
        latitude: 10.762622,
        longitude: 106.660172,
        timestamp: Date.now()
      };
      firebaseService.getLocation.mockResolvedValue(mockLocation);

      await LocationController.getMyLocation(req, res, next);

      expect(firebaseService.getLocation).toHaveBeenCalledWith('user123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        location: mockLocation
      });
    });

    // TEST 17: Handle when location doesn't exist (null)
    test('should return null when user has no location', async () => {
      firebaseService.getLocation.mockResolvedValue(null);

      await LocationController.getMyLocation(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        location: null
      });
    });

    // TEST 18: Error handling - Firebase read error
    test('should handle Firebase read errors', async () => {
      const error = new Error('Firebase read failed');
      firebaseService.getLocation.mockRejectedValue(error);

      await LocationController.getMyLocation(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getFamilyLocations', () => {
    // TEST 19: Happy path - get family locations successfully
    test('should return locations of all family members', async () => {
      const mockUser = {
        userFamily: ['family1', 'family2', 'family3']
      };
      const mockLocations = {
        family1: { latitude: 10.5, longitude: 106.5, timestamp: 123 },
        family2: { latitude: 11.5, longitude: 107.5, timestamp: 456 }
      };

      User.findById.mockResolvedValue(mockUser);
      firebaseService.getMultipleLocations.mockResolvedValue(mockLocations);

      await LocationController.getFamilyLocations(req, res, next);

      expect(User.findById).toHaveBeenCalledWith('user123');
      expect(firebaseService.getMultipleLocations).toHaveBeenCalledWith(['family1', 'family2', 'family3']);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        locations: mockLocations
      });
    });

    // TEST 20: Handle user with empty family list
    test('should return empty object when user has no family', async () => {
      const mockUser = { userFamily: [] };
      User.findById.mockResolvedValue(mockUser);

      await LocationController.getFamilyLocations(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        locations: {}
      });
      expect(firebaseService.getMultipleLocations).not.toHaveBeenCalled();
    });

    // TEST 21: Handle user with null/undefined family
    test('should handle user with null family list', async () => {
      const mockUser = { userFamily: null };
      User.findById.mockResolvedValue(mockUser);

      await LocationController.getFamilyLocations(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        locations: {}
      });
    });

    // TEST 22: Error handling - user not found
    test('should throw NotFoundError when user does not exist', async () => {
      User.findById.mockResolvedValue(null);

      await LocationController.getFamilyLocations(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(next.mock.calls[0][0].message).toBe('User not found');
    });

    // TEST 23: Error handling - database error
    test('should handle database errors when fetching user', async () => {
      const dbError = new Error('Database connection failed');
      User.findById.mockRejectedValue(dbError);

      await LocationController.getFamilyLocations(req, res, next);

      expect(next).toHaveBeenCalledWith(dbError);
    });

    // TEST 24: Edge case - large family list
    test('should handle users with many family members', async () => {
      const largeFamilyList = Array.from({ length: 100 }, (_, i) => `family${i}`);
      const mockUser = { userFamily: largeFamilyList };
      User.findById.mockResolvedValue(mockUser);
      firebaseService.getMultipleLocations.mockResolvedValue({});

      await LocationController.getFamilyLocations(req, res, next);

      expect(firebaseService.getMultipleLocations).toHaveBeenCalledWith(
        expect.arrayContaining(largeFamilyList)
      );
    });
  });

  describe('getUserLocation', () => {
    // TEST 25: Happy path - get own location
    test('should allow user to get their own location', async () => {
      req.params.userId = 'user123';
      const mockUser = { userFamily: ['family1'] };
      const mockLocation = { latitude: 10.5, longitude: 106.5 };

      User.findById.mockResolvedValue(mockUser);
      firebaseService.getLocation.mockResolvedValue(mockLocation);

      await LocationController.getUserLocation(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        location: mockLocation
      });
    });

    // TEST 26: Happy path - get family member location
    test('should allow user to get family member location', async () => {
      req.params.userId = 'family1';
      const mockUser = { userFamily: ['family1', 'family2'] };
      const mockLocation = { latitude: 11.5, longitude: 107.5 };

      User.findById.mockResolvedValue(mockUser);
      firebaseService.getLocation.mockResolvedValue(mockLocation);

      await LocationController.getUserLocation(req, res, next);

      expect(firebaseService.getLocation).toHaveBeenCalledWith('family1');
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        location: mockLocation
      });
    });

    // TEST 27: Authorization - reject non-family member access
    test('should reject access to non-family member location', async () => {
      req.params.userId = 'stranger123';
      const mockUser = { userFamily: ['family1', 'family2'] };

      User.findById.mockResolvedValue(mockUser);

      await LocationController.getUserLocation(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
      expect(next.mock.calls[0][0].message).toBe('You can only view locations of your family members');
      expect(firebaseService.getLocation).not.toHaveBeenCalled();
    });

    // TEST 28: Error handling - current user not found
    test('should throw NotFoundError when current user does not exist', async () => {
      req.params.userId = 'family1';
      User.findById.mockResolvedValue(null);

      await LocationController.getUserLocation(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
    });

    // TEST 29: Edge case - user with empty family tries to access other user
    test('should reject when user has no family and tries to access other user', async () => {
      req.params.userId = 'other123';
      const mockUser = { userFamily: [] };
      User.findById.mockResolvedValue(mockUser);

      await LocationController.getUserLocation(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    // TEST 30: Edge case - user with null family
    test('should handle null family list gracefully', async () => {
      req.params.userId = 'other123';
      const mockUser = { userFamily: null };
      User.findById.mockResolvedValue(mockUser);

      await LocationController.getUserLocation(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });
  });

  describe('removeLocation', () => {
    // TEST 31: Happy path - remove location successfully
    test('should remove user location successfully', async () => {
      firebaseService.removeLocation.mockResolvedValue(true);

      await LocationController.removeLocation(req, res, next);

      expect(firebaseService.removeLocation).toHaveBeenCalledWith('user123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Location removed successfully'
      });
    });

    // TEST 32: Socket.IO integration - emit removal event
    test('should emit location:removed event via Socket.IO', async () => {
      const mockIo = {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn()
      };
      req.app.get.mockReturnValue(mockIo);
      firebaseService.removeLocation.mockResolvedValue(true);

      await LocationController.removeLocation(req, res, next);

      expect(mockIo.to).toHaveBeenCalledWith('user:user123');
      expect(mockIo.emit).toHaveBeenCalledWith('location:removed', { userId: 'user123' });
    });

    // TEST 33: Handle when Socket.IO is not available
    test('should work when Socket.IO is not configured', async () => {
      req.app.get.mockReturnValue(null);
      firebaseService.removeLocation.mockResolvedValue(true);

      await LocationController.removeLocation(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    // TEST 34: Error handling - Firebase removal error
    test('should handle Firebase removal errors', async () => {
      const error = new Error('Firebase deletion failed');
      firebaseService.removeLocation.mockRejectedValue(error);

      await LocationController.removeLocation(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    // TEST 35: Edge case - remove already non-existent location
    test('should succeed even if location does not exist', async () => {
      firebaseService.removeLocation.mockResolvedValue(true);

      await LocationController.removeLocation(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  // Additional integration and edge case tests

  describe('Edge Cases and Integration', () => {
    // TEST 36: Concurrent requests handling
    test('should handle concurrent location updates', async () => {
      req.body = { latitude: 10.5, longitude: 106.5 };
      firebaseService.updateLocation.mockResolvedValue(true);

      const promise1 = LocationController.updateLocation(req, res, next);
      const promise2 = LocationController.updateLocation(req, res, next);

      await Promise.all([promise1, promise2]);

      expect(firebaseService.updateLocation).toHaveBeenCalledTimes(2);
    });

    // TEST 37: Very precise coordinates (many decimal places)
    test('should handle high-precision coordinates', async () => {
      req.body = {
        latitude: 10.76262299999999,
        longitude: 106.66017299999999
      };
      firebaseService.updateLocation.mockResolvedValue(true);

      await LocationController.updateLocation(req, res, next);

      expect(firebaseService.updateLocation).toHaveBeenCalledWith(
        'user123',
        10.76262299999999,
        106.66017299999999
      );
    });

    // TEST 38: Special characters in userId (MongoDB ObjectId format)
    test('should handle ObjectId format userId', async () => {
      req.user.id = '507f1f77bcf86cd799439011';
      req.body = { latitude: 10.5, longitude: 106.5 };
      firebaseService.updateLocation.mockResolvedValue(true);

      await LocationController.updateLocation(req, res, next);

      expect(firebaseService.updateLocation).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        10.5,
        106.5
      );
    });

    // TEST 39: Type coercion - numeric strings
    test('should reject numeric strings (strict type checking)', async () => {
      req.body = { latitude: '10.5', longitude: '106.5' };

      await LocationController.updateLocation(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });

    // TEST 40: NaN and Infinity handling
    test('should reject NaN and Infinity values', async () => {
      req.body = { latitude: NaN, longitude: Infinity };

      await LocationController.updateLocation(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    });
  });
});
