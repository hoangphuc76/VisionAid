/**
 * Firebase Service
 * Handles Firebase Admin SDK initialization and Realtime Database operations
 */

const admin = require('firebase-admin');
const config = require('../config/config');
const logger = require('../config/logger');
const { log } = require('winston');

class FirebaseService {
  constructor() {
    this.db = null;
    this.initialized = false;
  }

  /**
   * Initialize Firebase Admin SDK
   */
  initialize() {
    if (this.initialized) return;

    try {
        console.log("...................."+config.FIREBASE_PRIVATE_KEY)

      // Check if Firebase is already initialized (avoid re-init)
      if (admin.apps.length > 0) {
        this.db = admin.database();
        this.initialized = true;
        logger.info('✅ Firebase Admin SDK already initialized');
        return;
      }

      // Option 1: Using service account JSON file (recommended for production)
      // Uncomment this when you have serviceAccountKey.json
      const serviceAccount = require('../../serviceAccountKey.json');
      console.log("...................."+serviceAccount.private_key_id)
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: config.FIREBASE_DATABASE_URL
      });

    //   // Option 2: Using service account from environment variables
    //   if (config.FIREBASE_SERVICE_ACCOUNT) {
    //     try {
    //       const serviceAccount = JSON.parse(config.FIREBASE_SERVICE_ACCOUNT);
    //       admin.initializeApp({
    //         credential: admin.credential.cert(serviceAccount),
    //         databaseURL: config.FIREBASE_DATABASE_URL
    //       });
    //       logger.info('✅ Firebase initialized with service account from env');
    //     } catch (parseError) {
    //       logger.error('Failed to parse FIREBASE_SERVICE_ACCOUNT:', parseError);
    //       throw parseError;
    //     }
    //   } 
    //   // Option 3: Using minimal credentials (development only - NOT SECURE)
    //   else if (config.FIREBASE_PROJECT_ID && config.FIREBASE_CLIENT_EMAIL && config.FIREBASE_PRIVATE_KEY) {
    //     admin.initializeApp({
    //       credential: admin.credential.cert({
    //         projectId: config.FIREBASE_PROJECT_ID,
    //         clientEmail: config.FIREBASE_CLIENT_EMAIL,
    //         privateKey: config.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    //       }),
    //       databaseURL: config.FIREBASE_DATABASE_URL
    //     });
    //     logger.info('✅ Firebase initialized with env credentials');
    //   }
    //   else {
    //     logger.warn('⚠️  Firebase not configured - location sharing will not work');
    //     logger.warn('Please set FIREBASE_SERVICE_ACCOUNT or download serviceAccountKey.json');
    //     return;
    //   }

      this.db = admin.database();
      this.initialized = true;
      logger.info('✅ Firebase Admin SDK initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize Firebase Admin SDK:', error);
      logger.error('Error details:', error.message);
      // Don't throw - allow server to start without Firebase
      logger.warn('⚠️  Server will start without location sharing features');
    }
  }

  /**
   * Update user location in Firebase
   * @param {string} userId
   * @param {number} latitude
   * @param {number} longitude
   */
  async updateLocation(userId, latitude, longitude) {
    if (!this.initialized || !this.db) {
      throw new Error('Firebase not initialized');
    }

    try {
      await this.db.ref(`locations/${userId}`).set({
        lat: latitude,
        lng: longitude,
        ts: Date.now()
      });
      logger.info(`Location updated for user ${userId}`);
      return true;
    } catch (error) {
      logger.error(`Failed to update location for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get user location from Firebase
   * @param {string} userId
   */
  async getLocation(userId) {
    if (!this.initialized || !this.db) {
      throw new Error('Firebase not initialized');
    }

    try {
      const snapshot = await this.db.ref(`locations/${userId}`).once('value');
      const data = snapshot.val();
      
      if (!data) return null;

      return {
        latitude: data.lat,
        longitude: data.lng,
        timestamp: data.ts
      };
    } catch (error) {
      logger.error(`Failed to get location for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get multiple users' locations
   * @param {string[]} userIds
   */
  async getMultipleLocations(userIds) {
    if (!this.initialized || !this.db) {
      throw new Error('Firebase not initialized');
    }

    try {
      const locations = {};
      await Promise.all(
        userIds.map(async (userId) => {
          const loc = await this.getLocation(userId);
          if (loc) locations[userId] = loc;
        })
      );
      return locations;
    } catch (error) {
      logger.error('Failed to get multiple locations:', error);
      throw error;
    }
  }

  /**
   * Remove user location from Firebase
   * @param {string} userId
   */
  async removeLocation(userId) {
    if (!this.initialized || !this.db) {
      throw new Error('Firebase not initialized');
    }

    try {
      await this.db.ref(`locations/${userId}`).remove();
      logger.info(`Location removed for user ${userId}`);
      return true;
    } catch (error) {
      logger.error(`Failed to remove location for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Listen to location changes (for backend internal use)
   * @param {string} userId
   * @param {function} callback
   */
  listenToLocation(userId, callback) {
    if (!this.initialized || !this.db) {
      throw new Error('Firebase not initialized');
    }

    const ref = this.db.ref(`locations/${userId}`);
    ref.on('value', (snapshot) => {
      const data = snapshot.val();
      if (data) {
        callback({
          userId,
          latitude: data.lat,
          longitude: data.lng,
          timestamp: data.ts
        });
      } else {
        callback(null);
      }
    });

    // Return unsubscribe function
    return () => ref.off('value');
  }
}

module.exports = new FirebaseService();
