/**
 * Jest Setup File
 * Global test configuration and utilities
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.MONGODB_URI = 'mongodb://localhost:27017/visionaid_test';

// Suppress console logs during tests (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };

// Global test utilities
global.testUtils = {
  /**
   * Create mock Express request object
   */
  mockRequest: (overrides = {}) => ({
    user: { id: 'testuser123' },
    body: {},
    params: {},
    query: {},
    headers: {},
    app: {
      get: jest.fn()
    },
    ...overrides
  }),

  /**
   * Create mock Express response object
   */
  mockResponse: () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  },

  /**
   * Create mock next function
   */
  mockNext: () => jest.fn(),

  /**
   * Create mock Socket.IO instance
   */
  mockSocketIO: () => ({
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
    on: jest.fn(),
    off: jest.fn()
  }),

  /**
   * Create mock user object
   */
  mockUser: (overrides = {}) => ({
    _id: 'user123',
    email: 'test@example.com',
    userFamily: [],
    created_at: new Date(),
    ...overrides
  }),

  /**
   * Create mock location object
   */
  mockLocation: (overrides = {}) => ({
    latitude: 10.762622,
    longitude: 106.660172,
    timestamp: Date.now(),
    ...overrides
  })
};

// Extend Jest matchers if needed
expect.extend({
  toBeValidCoordinate(received) {
    const pass = 
      typeof received === 'number' &&
      !isNaN(received) &&
      isFinite(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid coordinate`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid coordinate`,
        pass: false,
      };
    }
  },

  toBeValidLatitude(received) {
    const pass = 
      typeof received === 'number' &&
      received >= -90 &&
      received <= 90;
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid latitude`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be between -90 and 90`,
        pass: false,
      };
    }
  },

  toBeValidLongitude(received) {
    const pass = 
      typeof received === 'number' &&
      received >= -180 &&
      received <= 180;
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid longitude`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be between -180 and 180`,
        pass: false,
      };
    }
  }
});
