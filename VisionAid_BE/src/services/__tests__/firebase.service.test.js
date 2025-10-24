/**
 * Unit Tests for Firebase Service
 * Tests Firebase Admin SDK initialization and Realtime Database operations
 * Coverage: initialize, updateLocation, getLocation, getMultipleLocations, removeLocation, listenToLocation
 */

const admin = require('firebase-admin');
const firebaseService = require('../firebase.service');
const config = require('../../config/config');
const logger = require('../../config/logger');

// Mock dependencies
jest.mock('firebase-admin');
jest.mock('../../config/config');
jest.mock('../../config/logger');

describe('FirebaseService', () => {
  let mockDb, mockRef, mockSnapshot;

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset service state
    firebaseService.db = null;
    firebaseService.initialized = false;

    // Setup mock snapshot
    mockSnapshot = {
      val: jest.fn()
    };

    // Setup mock reference
    mockRef = {
      set: jest.fn().mockResolvedValue(undefined),
      once: jest.fn().mockResolvedValue(mockSnapshot),
      remove: jest.fn().mockResolvedValue(undefined),
      on: jest.fn(),
      off: jest.fn()
    };

    // Setup mock database
    mockDb = {
      ref: jest.fn().mockReturnValue(mockRef)
    };

    // Setup admin mocks
    admin.apps = [];
    admin.initializeApp = jest.fn();
    admin.database = jest.fn().mockReturnValue(mockDb);
    admin.credential = {
      cert: jest.fn().mockReturnValue({ type: 'service_account' })
    };

    // Setup config
    config.FIREBASE_DATABASE_URL = 'https://test-project.firebaseio.com';
  });

  // ==================== initialize Tests ====================
  describe('initialize', () => {
    
    it('should initialize Firebase successfully with service account', () => {
      const mockServiceAccount = {
        project_id: 'test-project',
        private_key_id: 'key123',
        private_key: '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----\n',
        client_email: 'test@test-project.iam.gserviceaccount.com'
      };

      jest.mock('../../serviceAccountKey.json', () => mockServiceAccount, { virtual: true });

      firebaseService.initialize();

      expect(admin.initializeApp).toHaveBeenCalled();
      expect(admin.database).toHaveBeenCalled();
      expect(firebaseService.initialized).toBe(true);
      expect(firebaseService.db).toBe(mockDb);
    });

    it('should skip initialization if already initialized', () => {
      firebaseService.initialized = true;
      firebaseService.db = mockDb;

      firebaseService.initialize();

      expect(admin.initializeApp).not.toHaveBeenCalled();
      expect(firebaseService.db).toBe(mockDb);
    });

    it('should use existing Firebase app if already initialized', () => {
      admin.apps = [{ name: '[DEFAULT]' }];

      firebaseService.initialize();

      expect(admin.initializeApp).not.toHaveBeenCalled();
      expect(admin.database).toHaveBeenCalled();
      expect(firebaseService.initialized).toBe(true);
    });

    it('should handle initialization errors gracefully', () => {
      admin.initializeApp.mockImplementation(() => {
        throw new Error('Invalid credentials');
      });

      firebaseService.initialize();

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to initialize Firebase Admin SDK'),
        expect.any(Error)
      );
      expect(firebaseService.initialized).toBe(false);
    });
  });

  // ==================== updateLocation Tests ====================
  describe('updateLocation', () => {
    
    beforeEach(() => {
      firebaseService.initialized = true;
      firebaseService.db = mockDb;
    });

    it('should update location successfully', async () => {
      const userId = 'user123';
      const latitude = 10.5;
      const longitude = 106.7;

      const result = await firebaseService.updateLocation(userId, latitude, longitude);

      expect(mockDb.ref).toHaveBeenCalledWith('locations/user123');
      expect(mockRef.set).toHaveBeenCalledWith({
        lat: 10.5,
        lng: 106.7,
        ts: expect.any(Number)
      });
      expect(result).toBe(true);
    });

    it('should throw error when Firebase not initialized', async () => {
      firebaseService.initialized = false;
      firebaseService.db = null;

      await expect(
        firebaseService.updateLocation('user1', 10, 20)
      ).rejects.toThrow('Firebase not initialized');
    });

    it('should propagate Firebase set errors', async () => {
      const mockError = new Error('Permission denied');
      mockRef.set.mockRejectedValue(mockError);

      await expect(
        firebaseService.updateLocation('user1', 10, 20)
      ).rejects.toThrow('Permission denied');
    });

    it('should handle boundary coordinates', async () => {
      await firebaseService.updateLocation('user1', -90, -180);
      await firebaseService.updateLocation('user2', 90, 180);

      expect(mockRef.set).toHaveBeenCalledWith({
        lat: -90,
        lng: -180,
        ts: expect.any(Number)
      });
      expect(mockRef.set).toHaveBeenCalledWith({
        lat: 90,
        lng: 180,
        ts: expect.any(Number)
      });
    });
  });

  // ==================== getLocation Tests ====================
  describe('getLocation', () => {
    
    beforeEach(() => {
      firebaseService.initialized = true;
      firebaseService.db = mockDb;
    });

    it('should get location successfully', async () => {
      mockSnapshot.val.mockReturnValue({
        lat: 10.5,
        lng: 106.7,
        ts: 1234567890
      });

      const location = await firebaseService.getLocation('user123');

      expect(mockDb.ref).toHaveBeenCalledWith('locations/user123');
      expect(mockRef.once).toHaveBeenCalledWith('value');
      expect(location).toEqual({
        latitude: 10.5,
        longitude: 106.7,
        timestamp: 1234567890
      });
    });

    it('should return null when location does not exist', async () => {
      mockSnapshot.val.mockReturnValue(null);

      const location = await firebaseService.getLocation('user123');

      expect(location).toBeNull();
    });

    it('should throw error when Firebase not initialized', async () => {
      firebaseService.initialized = false;

      await expect(
        firebaseService.getLocation('user1')
      ).rejects.toThrow('Firebase not initialized');
    });

    it('should propagate Firebase read errors', async () => {
      const mockError = new Error('Network error');
      mockRef.once.mockRejectedValue(mockError);

      await expect(
        firebaseService.getLocation('user1')
      ).rejects.toThrow('Network error');
    });
  });

  // ==================== getMultipleLocations Tests ====================
  describe('getMultipleLocations', () => {
    
    beforeEach(() => {
      firebaseService.initialized = true;
      firebaseService.db = mockDb;
    });

    it('should get multiple locations successfully', async () => {
      mockSnapshot.val
        .mockReturnValueOnce({ lat: 10.5, lng: 106.7, ts: 111 })
        .mockReturnValueOnce({ lat: 11.0, lng: 107.0, ts: 222 });

      const locations = await firebaseService.getMultipleLocations(['user1', 'user2']);

      expect(locations).toEqual({
        user1: { latitude: 10.5, longitude: 106.7, timestamp: 111 },
        user2: { latitude: 11.0, longitude: 107.0, timestamp: 222 }
      });
    });

    it('should handle partial location data', async () => {
      mockSnapshot.val
        .mockReturnValueOnce({ lat: 10.5, lng: 106.7, ts: 111 })
        .mockReturnValueOnce(null);

      const locations = await firebaseService.getMultipleLocations(['user1', 'user2']);

      expect(locations).toEqual({
        user1: { latitude: 10.5, longitude: 106.7, timestamp: 111 }
      });
    });

    it('should return empty object when no locations found', async () => {
      mockSnapshot.val.mockReturnValue(null);

      const locations = await firebaseService.getMultipleLocations(['user1', 'user2']);

      expect(locations).toEqual({});
    });

    it('should throw error when Firebase not initialized', async () => {
      firebaseService.initialized = false;

      await expect(
        firebaseService.getMultipleLocations(['user1'])
      ).rejects.toThrow('Firebase not initialized');
    });
  });

  // ==================== removeLocation Tests ====================
  describe('removeLocation', () => {
    
    beforeEach(() => {
      firebaseService.initialized = true;
      firebaseService.db = mockDb;
    });

    it('should remove location successfully', async () => {
      const result = await firebaseService.removeLocation('user123');

      expect(mockDb.ref).toHaveBeenCalledWith('locations/user123');
      expect(mockRef.remove).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should throw error when Firebase not initialized', async () => {
      firebaseService.initialized = false;

      await expect(
        firebaseService.removeLocation('user1')
      ).rejects.toThrow('Firebase not initialized');
    });

    it('should propagate Firebase remove errors', async () => {
      const mockError = new Error('Permission denied');
      mockRef.remove.mockRejectedValue(mockError);

      await expect(
        firebaseService.removeLocation('user1')
      ).rejects.toThrow('Permission denied');
    });
  });

  // ==================== listenToLocation Tests ====================
  describe('listenToLocation', () => {
    
    beforeEach(() => {
      firebaseService.initialized = true;
      firebaseService.db = mockDb;
    });

    it('should listen to location changes', () => {
      const callback = jest.fn();
      mockRef.on.mockImplementation((event, cb) => {
        const mockSnap = { val: () => ({ lat: 10, lng: 20, ts: 123 }) };
        cb(mockSnap);
      });

      const unsubscribe = firebaseService.listenToLocation('user1', callback);

      expect(mockDb.ref).toHaveBeenCalledWith('locations/user1');
      expect(mockRef.on).toHaveBeenCalledWith('value', expect.any(Function));
      expect(callback).toHaveBeenCalledWith({
        userId: 'user1',
        latitude: 10,
        longitude: 20,
        timestamp: 123
      });
      expect(typeof unsubscribe).toBe('function');
    });

    it('should call callback with null when location is removed', () => {
      const callback = jest.fn();
      mockRef.on.mockImplementation((event, cb) => {
        const mockSnap = { val: () => null };
        cb(mockSnap);
      });

      firebaseService.listenToLocation('user1', callback);

      expect(callback).toHaveBeenCalledWith(null);
    });

    it('should return unsubscribe function', () => {
      const callback = jest.fn();
      const unsubscribe = firebaseService.listenToLocation('user1', callback);

      unsubscribe();

      expect(mockRef.off).toHaveBeenCalledWith('value');
    });

    it('should throw error when Firebase not initialized', () => {
      firebaseService.initialized = false;

      expect(() => {
        firebaseService.listenToLocation('user1', jest.fn());
      }).toThrow('Firebase not initialized');
    });
  });
});
