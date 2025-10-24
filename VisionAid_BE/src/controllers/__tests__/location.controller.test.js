/**
 * Unit Tests for Location Controller
 * Tests all CRUD operations for location sharing via Firebase
 * Coverage: updateLocation, getMyLocation, getFamilyLocations, getUserLocation, removeLocation
 */

// Mock dependencies FIRST before requiring
jest.mock('../../services/firebase.service', () => ({
  updateLocation: jest.fn(),
  getLocation: jest.fn(),
  getMultipleLocations: jest.fn(),
  removeLocation: jest.fn()
}));

jest.mock('../../models/user.model');
jest.mock('../../config/logger');

const locationController = require('../location.controller');
const firebaseService = require('../../services/firebase.service');
const User = require('../../models/user.model');
const logger = require('../../config/logger');
const { ValidationError, NotFoundError } = require('../../utils/errors');

describe('LocationController', () => {
  let req, res, next, mockIo;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default request mock
    req = {
      user: { id: 'user1' },
      body: {},
      params: {},
      app: {
        get: jest.fn()
      }
    };

    // Setup response mock
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    // Setup next mock
    next = jest.fn();

    // Setup Socket.IO mock
    mockIo = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn()
    };
  });

  // ==================== 2.1 updateLocation Tests ====================
  describe('2.1 updateLocation', () => {
    
    // Test 2.1.1: Valid coordinates
    it('2.1.1 - should update location successfully with valid coordinates', async () => {
      req.body = { latitude: 10.5, longitude: 106.7 };
      req.app.get.mockReturnValue(mockIo);
      firebaseService.updateLocation.mockResolvedValue(true);
      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          userFamily: []
        })
      });

      await locationController.updateLocation(req, res, next);

      expect(firebaseService.updateLocation).toHaveBeenCalledWith('user1', 10.5, 106.7);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Location updated successfully'
      });
      expect(mockIo.to).toHaveBeenCalledWith('user:user1');
      expect(mockIo.emit).toHaveBeenCalledWith('location:updated', {
        userId: 'user1',
        latitude: 10.5,
        longitude: 106.7,
        timestamp: expect.any(Number)
      });
      expect(next).not.toHaveBeenCalled();
    });

    // Test 2.1.2: Boundary latitude values
    it.each([
      [-90, 0, 'minimum latitude'],
      [90, 0, 'maximum latitude'],
      [0, -180, 'minimum longitude'],
      [0, 180, 'maximum longitude']
    ])('2.1.2 - should accept boundary values: %s, %s (%s)', async (lat, lon) => {
      req.body = { latitude: lat, longitude: lon };
      req.app.get.mockReturnValue(null);
      firebaseService.updateLocation.mockResolvedValue(true);

      await locationController.updateLocation(req, res, next);

      expect(firebaseService.updateLocation).toHaveBeenCalledWith('user1', lat, lon);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(next).not.toHaveBeenCalled();
    });

    // Test 2.1.3: Invalid latitude range
    it.each([
      [91, 0, 'latitude must be between -90 and 90'],
      [-91, 0, 'latitude must be between -90 and 90'],
      [0, 181, 'longitude must be between -180 and 180'],
      [0, -181, 'longitude must be between -180 and 180']
    ])('2.1.3 - should reject invalid range: lat=%s, lon=%s', async (lat, lon, expectedMsg) => {
      req.body = { latitude: lat, longitude: lon };

      await locationController.updateLocation(req, res, next);

      expect(firebaseService.updateLocation).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
      expect(next.mock.calls[0][0].message).toBe(expectedMsg);
    });

    // Test 2.1.4: Non-numeric coordinates
    it.each([
      ['10.5', 106.7, 'string latitude'],
      [10.5, '106.7', 'string longitude'],
      ['10.5', '106.7', 'both strings'],
      [null, 106.7, 'null latitude'],
      [10.5, undefined, 'undefined longitude']
    ])('2.1.4 - should reject non-numeric: %s, %s (%s)', async (lat, lon) => {
      req.body = { latitude: lat, longitude: lon };

      await locationController.updateLocation(req, res, next);

      expect(firebaseService.updateLocation).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
      expect(next.mock.calls[0][0].message).toBe('latitude and longitude must be numbers');
    });

    // Test 2.1.5: Socket emission to family members
    it('2.1.5 - should emit location:updated to family members', async () => {
      req.body = { latitude: 10.5, longitude: 106.7 };
      req.app.get.mockReturnValue(mockIo);
      firebaseService.updateLocation.mockResolvedValue(true);
      
      const mockUser = {
        userFamily: ['user2', 'user3']
      };
      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      await locationController.updateLocation(req, res, next);

      expect(User.findById).toHaveBeenCalledWith('user1');
      expect(mockIo.to).toHaveBeenCalledWith('user:user2');
      expect(mockIo.to).toHaveBeenCalledWith('user:user3');
      expect(mockIo.emit).toHaveBeenCalledWith('family:location:updated', {
        userId: 'user1',
        latitude: 10.5,
        longitude: 106.7,
        timestamp: expect.any(Number)
      });
      expect(mockIo.emit).toHaveBeenCalledTimes(3); // 1 for user + 2 for family
    });

    // Test 2.1.6: No Socket.IO available
    it('2.1.6 - should succeed without Socket.IO when io is null', async () => {
      req.body = { latitude: 10.5, longitude: 106.7 };
      req.app.get.mockReturnValue(null);
      firebaseService.updateLocation.mockResolvedValue(true);

      await locationController.updateLocation(req, res, next);

      expect(firebaseService.updateLocation).toHaveBeenCalledWith('user1', 10.5, 106.7);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockIo.to).not.toHaveBeenCalled();
      expect(mockIo.emit).not.toHaveBeenCalled();
    });

    // Test 2.1.7: Firebase service error propagation
    it('2.1.7 - should propagate firebaseService.updateLocation error to next', async () => {
      req.body = { latitude: 10.5, longitude: 106.7 };
      const mockError = new Error('Firebase connection failed');
      firebaseService.updateLocation.mockRejectedValue(mockError);

      await locationController.updateLocation(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
      expect(res.status).not.toHaveBeenCalled();
    });

    // Test 2.1.8: User.findById error during family emission
    it('2.1.8 - should propagate User.findById error to next', async () => {
      req.body = { latitude: 10.5, longitude: 106.7 };
      req.app.get.mockReturnValue(mockIo);
      firebaseService.updateLocation.mockResolvedValue(true);
      
      const mockError = new Error('Database error');
      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockRejectedValue(mockError)
      });

      await locationController.updateLocation(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });
  });

  // ==================== 2.2 getMyLocation Tests ====================
  describe('2.2 getMyLocation', () => {
    
    // Test 2.2.1: Location exists
    it('2.2.1 - should return location when it exists', async () => {
      const mockLocation = {
        latitude: 10.5,
        longitude: 106.7,
        timestamp: 1234567890
      };
      firebaseService.getLocation.mockResolvedValue(mockLocation);

      await locationController.getMyLocation(req, res, next);

      expect(firebaseService.getLocation).toHaveBeenCalledWith('user1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        location: mockLocation
      });
      expect(next).not.toHaveBeenCalled();
    });

    // Test 2.2.2: Location not found
    it('2.2.2 - should return null when location does not exist', async () => {
      firebaseService.getLocation.mockResolvedValue(null);

      await locationController.getMyLocation(req, res, next);

      expect(firebaseService.getLocation).toHaveBeenCalledWith('user1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        location: null
      });
    });

    // Test 2.2.3: Firebase service error
    it('2.2.3 - should propagate Firebase service error to next', async () => {
      const mockError = new Error('Firebase not initialized');
      firebaseService.getLocation.mockRejectedValue(mockError);

      await locationController.getMyLocation(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
      expect(res.status).not.toHaveBeenCalled();
    });

    // Test 2.2.4: No socket emissions
    it('2.2.4 - should not emit any socket events', async () => {
      req.app.get.mockReturnValue(mockIo);
      firebaseService.getLocation.mockResolvedValue({ latitude: 10, longitude: 20, timestamp: 123 });

      await locationController.getMyLocation(req, res, next);

      expect(mockIo.to).not.toHaveBeenCalled();
      expect(mockIo.emit).not.toHaveBeenCalled();
    });
  });

  // ==================== 2.3 getFamilyLocations Tests ====================
  describe('2.3 getFamilyLocations', () => {
    
    // Test 2.3.1: Multiple family members with locations
    it('2.3.1 - should return locations for multiple family members', async () => {
      const mockLocations = {
        user2: { latitude: 10.5, longitude: 106.7, timestamp: 123 },
        user3: { latitude: 11.0, longitude: 107.0, timestamp: 456 }
      };
      
      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          userFamily: ['user2', 'user3']
        })
      });
      firebaseService.getMultipleLocations.mockResolvedValue(mockLocations);

      await locationController.getFamilyLocations(req, res, next);

      expect(User.findById).toHaveBeenCalledWith('user1');
      expect(firebaseService.getMultipleLocations).toHaveBeenCalledWith(['user2', 'user3']);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        locations: mockLocations
      });
    });

    // Test 2.3.2: Empty family list
    it('2.3.2 - should return empty object when userFamily is empty', async () => {
      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          userFamily: []
        })
      });

      await locationController.getFamilyLocations(req, res, next);

      expect(firebaseService.getMultipleLocations).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        locations: {}
      });
    });

    // Test 2.3.3: User not found
    it('2.3.3 - should throw NotFoundError when user does not exist', async () => {
      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await locationController.getFamilyLocations(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(next.mock.calls[0][0].message).toBe('User not found');
      expect(firebaseService.getMultipleLocations).not.toHaveBeenCalled();
    });

    // Test 2.3.4: Partial location data
    it('2.3.4 - should handle partial location data correctly', async () => {
      const mockLocations = {
        user2: { latitude: 10.5, longitude: 106.7, timestamp: 123 }
        // user3 location is null/missing
      };
      
      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          userFamily: ['user2', 'user3']
        })
      });
      firebaseService.getMultipleLocations.mockResolvedValue(mockLocations);

      await locationController.getFamilyLocations(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        locations: mockLocations
      });
    });

    // Test 2.3.5: Firebase service error
    it('2.3.5 - should propagate Firebase service error to next', async () => {
      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          userFamily: ['user2']
        })
      });
      
      const mockError = new Error('Firebase connection failed');
      firebaseService.getMultipleLocations.mockRejectedValue(mockError);

      await locationController.getFamilyLocations(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });

    // Test 2.3.6: Handle null userFamily
    it('2.3.6 - should handle null userFamily as empty array', async () => {
      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          userFamily: null
        })
      });

      await locationController.getFamilyLocations(req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        locations: {}
      });
    });
  });

  // ==================== 2.4 getUserLocation Tests ====================
  describe('2.4 getUserLocation', () => {
    
    // Test 2.4.1: Own location retrieval
    it('2.4.1 - should retrieve own location successfully', async () => {
      req.params.userId = 'user1';
      const mockLocation = { latitude: 10.5, longitude: 106.7, timestamp: 123 };
      
      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          userFamily: ['user2']
        })
      });
      firebaseService.getLocation.mockResolvedValue(mockLocation);

      await locationController.getUserLocation(req, res, next);

      expect(firebaseService.getLocation).toHaveBeenCalledWith('user1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        location: mockLocation
      });
    });

    // Test 2.4.2: Family member location retrieval
    it('2.4.2 - should retrieve family member location successfully', async () => {
      req.params.userId = 'user2';
      const mockLocation = { latitude: 11.0, longitude: 107.0, timestamp: 456 };
      
      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          userFamily: ['user2', 'user3']
        })
      });
      firebaseService.getLocation.mockResolvedValue(mockLocation);

      await locationController.getUserLocation(req, res, next);

      expect(User.findById).toHaveBeenCalledWith('user1');
      expect(firebaseService.getLocation).toHaveBeenCalledWith('user2');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        location: mockLocation
      });
    });

    // Test 2.4.3: Non-family member access denied
    it('2.4.3 - should deny access to non-family member location', async () => {
      req.params.userId = 'stranger';
      
      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          userFamily: ['user2', 'user3']
        })
      });

      await locationController.getUserLocation(req, res, next);

      expect(firebaseService.getLocation).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
      expect(next.mock.calls[0][0].message).toBe('You can only view locations of your family members');
    });

    // Test 2.4.4: Current user not found
    it('2.4.4 - should throw NotFoundError when current user does not exist', async () => {
      req.params.userId = 'user2';
      
      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      await locationController.getUserLocation(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(NotFoundError));
      expect(next.mock.calls[0][0].message).toBe('User not found');
      expect(firebaseService.getLocation).not.toHaveBeenCalled();
    });

    // Test 2.4.5: User.findById database error
    it('2.4.5 - should propagate User.findById error to next', async () => {
      req.params.userId = 'user2';
      const mockError = new Error('Database connection failed');
      
      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockRejectedValue(mockError)
      });

      await locationController.getUserLocation(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
    });

    // Test 2.4.6: Handle empty userFamily array
    it('2.4.6 - should deny access when userFamily is empty and requesting another user', async () => {
      req.params.userId = 'user2';
      
      User.findById = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({
          userFamily: []
        })
      });

      await locationController.getUserLocation(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
      expect(next.mock.calls[0][0].message).toBe('You can only view locations of your family members');
    });
  });

  // ==================== 2.5 removeLocation Tests ====================
  describe('2.5 removeLocation', () => {
    
    // Test 2.5.1: Successful deletion with Socket.IO
    it('2.5.1 - should remove location and emit socket event successfully', async () => {
      req.app.get.mockReturnValue(mockIo);
      firebaseService.removeLocation.mockResolvedValue(true);

      await locationController.removeLocation(req, res, next);

      expect(firebaseService.removeLocation).toHaveBeenCalledWith('user1');
      expect(mockIo.to).toHaveBeenCalledWith('user:user1');
      expect(mockIo.emit).toHaveBeenCalledWith('location:removed', { userId: 'user1' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Location removed successfully'
      });
      expect(next).not.toHaveBeenCalled();
    });

    // Test 2.5.2: Firebase service error
    it('2.5.2 - should propagate Firebase service error to next', async () => {
      const mockError = new Error('Firebase not initialized');
      firebaseService.removeLocation.mockRejectedValue(mockError);

      await locationController.removeLocation(req, res, next);

      expect(next).toHaveBeenCalledWith(mockError);
      expect(res.status).not.toHaveBeenCalled();
    });

    // Test 2.5.3: Socket.IO unavailable
    it('2.5.3 - should succeed without Socket.IO when io is null', async () => {
      req.app.get.mockReturnValue(null);
      firebaseService.removeLocation.mockResolvedValue(true);

      await locationController.removeLocation(req, res, next);

      expect(firebaseService.removeLocation).toHaveBeenCalledWith('user1');
      expect(mockIo.to).not.toHaveBeenCalled();
      expect(mockIo.emit).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Location removed successfully'
      });
    });

    // Test 2.5.4: Verify removal occurs before emission
    it('2.5.4 - should call removeLocation before emitting socket event', async () => {
      req.app.get.mockReturnValue(mockIo);
      const callOrder = [];
      
      firebaseService.removeLocation.mockImplementation(() => {
        callOrder.push('removeLocation');
        return Promise.resolve(true);
      });
      
      mockIo.emit.mockImplementation(() => {
        callOrder.push('emit');
      });

      await locationController.removeLocation(req, res, next);

      expect(callOrder).toEqual(['removeLocation', 'emit']);
    });

    // Test 2.5.5: Multiple concurrent removal requests
    it('2.5.5 - should handle concurrent removal requests independently', async () => {
      req.app.get.mockReturnValue(mockIo);
      firebaseService.removeLocation.mockResolvedValue(true);

      const req2 = { ...req, user: { id: 'user2' } };
      const res2 = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };

      await Promise.all([
        locationController.removeLocation(req, res, next),
        locationController.removeLocation(req2, res2, next)
      ]);

      expect(firebaseService.removeLocation).toHaveBeenCalledWith('user1');
      expect(firebaseService.removeLocation).toHaveBeenCalledWith('user2');
      expect(firebaseService.removeLocation).toHaveBeenCalledTimes(2);
    });
  });
});
