/**
 * User Service
 * Business logic for user-related operations
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user.model.js');
const RefreshToken = require('../models/refreshToken.model.js');
const config = require('../config/config');
const logger = require('../config/logger');
const { ValidationError, NotFoundError, ConflictError, UnauthorizedError } = require('../utils/errors');

class UserService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {Object} metadata - Additional metadata (ip_address, user_agent)
   * @returns {Object} User data and tokens
   */
  async register(userData, metadata = {}) {
    try {
      const { email, password } = userData;

      console.log('Registering user with email:', email);

      // Validate input
      if (!email || !password) {
        throw new ValidationError('Email and password are required');
      }

      if (password.length < 8) {
        throw new ValidationError('Password must be at least 8 characters long');
      }

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        throw new ConflictError('Email already exists');
      }

      // Create new user
      const user = new User({
        email: email.toLowerCase(),
        password_hash: password, // Will be hashed by the pre-save middleware
      });

      await user.save();

      logger.info(`New user registered: ${email}`, { userId: user._id });

      // Generate JWT tokens
      const accessToken = this.generateAccessToken(user);
      const refreshToken = await this.generateRefreshToken(user, metadata);

      return {
        success: true,
        user: user.getProfile(),
        accessToken,
        refreshToken,
      };
    } catch (error) {
      // Handle MongoDB validation errors
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        throw new ValidationError(messages.join(', '));
      }

      // Handle duplicate key error
      if (error.code === 11000) {
        throw new ConflictError('Email already exists');
      }

      logger.error('User registration failed:', error);
      throw error;
    }
  }

  /**
   * Authenticate user login
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @param {Object} metadata - Additional metadata (ip_address, user_agent)
   * @returns {Object} User data and tokens
   */
  async login(credentials, metadata = {}) {
    try {
      const { email, password } = credentials;
      console.log('Attempting login for email:', email);
      // Validate input
      if (!email || !password) {
        throw new ValidationError('Email and password are required');
      }

      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Validate password
      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        throw new UnauthorizedError('Invalid password');
      }

      // Update last login
      await user.updateLastLogin();

      logger.info(`User logged in: ${email}`, { userId: user.id });

      // Generate JWT tokens
      const accessToken = this.generateAccessToken(user);
      const refreshToken = await this.generateRefreshToken(user, metadata);

      return {
        success: true,
        user: user.getProfile(),
        accessToken,
        refreshToken,
      };
    } catch (error) {
      logger.error('User login failed:', error);
      throw error;
    }
  }

  /**
   * Get user profile by ID
   * @param {string} userId - User ID (MongoDB ObjectId)
   * @returns {Object} User profile data
   */
  async getProfile(userId) {
    try {
      const user = await User.findActiveById(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      return user.getProfile();
    } catch (error) {
      // Handle invalid ObjectId
      if (error.name === 'CastError') {
        throw new ValidationError('Invalid user ID format');
      }

      logger.error('Get user profile failed:', error);
      throw error;
    }
  }



  /**
   * Generate JWT access token for user
   * @param {Object} user - User object (Mongoose document)
   * @returns {string} JWT access token
   */
  generateAccessToken(user) {
    return jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: user.role
      },
      config.JWT.SECRET,
      { expiresIn: config.JWT.EXPIRES_IN }
    );
  }

  /**
   * Generate refresh token for user
   * @param {Object} user - User object (Mongoose document)
   * @param {Object} metadata - Additional metadata (ip_address, user_agent)
   * @returns {string} Refresh token
   */
  async generateRefreshToken(user, metadata = {}) {
    try {
      // Generate random token
      const tokenString = crypto.randomBytes(64).toString('hex');

      // Calculate expiration date
      const expiresIn = config.JWT.REFRESH_EXPIRES_IN;
      const expiresAt = new Date();

      // Parse expiration string (e.g., "7d", "30d", "1h")
      const match = expiresIn.match(/^(\d+)([dhms])$/);
      if (match) {
        const value = parseInt(match[1]);
        const unit = match[2];

        switch (unit) {
          case 'd':
            expiresAt.setDate(expiresAt.getDate() + value);
            break;
          case 'h':
            expiresAt.setHours(expiresAt.getHours() + value);
            break;
          case 'm':
            expiresAt.setMinutes(expiresAt.getMinutes() + value);
            break;
          case 's':
            expiresAt.setSeconds(expiresAt.getSeconds() + value);
            break;
        }
      }

      // Save refresh token to database
      const tokenDoc = await RefreshToken.createToken({
        token: tokenString,
        user_id: user._id,
        expires_at: expiresAt,
        ip_address: metadata.ip_address || null,
        user_agent: metadata.user_agent || null,
      });

      return tokenString;
    } catch (error) {
      logger.error('Generate refresh token failed:', error);
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken - Refresh token string
   * @param {Object} metadata - Additional metadata (ip_address, user_agent)
   * @returns {Object} New access token and refresh token
   */
  async refreshAccessToken(refreshToken, metadata = {}) {
    try {
      // Find refresh token in database
      const tokenDoc = await RefreshToken.findByToken(refreshToken);

      if (!tokenDoc) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      // Check if token is expired
      if (tokenDoc.isExpired()) {
        await tokenDoc.revoke();
        throw new UnauthorizedError('Refresh token expired');
      }

      // Find user
      const user = await User.findActiveById(tokenDoc.user_id);
      if (!user) {
        await tokenDoc.revoke();
        throw new NotFoundError('User not found');
      }

      // Revoke old refresh token
      await tokenDoc.revoke();

      // Generate new tokens
      const newAccessToken = this.generateAccessToken(user);
      const newRefreshToken = await this.generateRefreshToken(user, metadata);

      logger.info(`Access token refreshed for user: ${user.email}`, { userId: user._id });

      return {
        success: true,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: user.getProfile(),
      };
    } catch (error) {
      logger.error('Refresh access token failed:', error);
      throw error;
    }
  }



  /**
   * Generate JWT token for user (legacy method for backward compatibility)
   * @param {Object} user - User object (Mongoose document)
   * @returns {string} JWT token
   */
  generateToken(user) {
    return this.generateAccessToken(user);
  }

  /**
   * Verify JWT access token
   * @param {string} token - JWT access token
   * @returns {Object} Decoded token data
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, config.JWT.SECRET);
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }

  /**
   * Replace user's family list (synchronizes both sides)
   * @param {string} userId
   * @param {string[]} familyIds
   */
  async setUserFamily(userId, familyIds = []) {
    const user = await User.findById(userId);
    if (!user || !user.is_active) throw new NotFoundError('User not found');

    // Normalize incoming ids: unique, strings, remove self
    const incoming = Array.isArray(familyIds)
      ? Array.from(new Set(familyIds.map(String))).filter(id => id && id !== String(userId))
      : [];

    const existing = (user.userFamily || []).map(String);

    const toAdd = incoming.filter(id => !existing.includes(id));
    const toRemove = existing.filter(id => !incoming.includes(id));

    // Add reciprocal links
    await Promise.all(toAdd.map(async fid => {
      if (!fid) return;
      const f = await User.findById(fid);
      if (f && f.is_active) {
        f.userFamily = f.userFamily || [];
        if (!f.userFamily.map(String).includes(String(userId))) {
          f.userFamily.push(userId);
          await f.save();
        }
      }
    }));

    // Remove reciprocal links
    await Promise.all(toRemove.map(async fid => {
      if (!fid) return;
      const f = await User.findById(fid);
      if (f) {
        f.userFamily = (f.userFamily || []).filter(i => String(i) !== String(userId));
        await f.save();
      }
    }));

    // Set user's family (store as array of ids)
    user.userFamily = incoming;
    await user.save();

    const updated = await User.findById(userId).select('-password_hash').populate({ path: 'userFamily', select: 'id email created_at' });
    return updated.getProfile();
  }

  /**
   * Add family members to user's userFamily (no duplicates) and sync reciprocal
   * @param {string} userId
   * @param {string[]} familyIds
   */
  async addFamilyMembers(userId, familyIds = []) {
    const user = await User.findById(userId);
    if (!user || !user.is_active) throw new NotFoundError('User not found');

    user.userFamily = user.userFamily || [];
    const existing = new Set(user.userFamily.map(String));
    const toAdd = Array.from(new Set((familyIds || []).map(String))).filter(id => id && id !== String(userId) && !existing.has(id));

    // Add reciprocal links in parallel
    await Promise.all(toAdd.map(async fid => {
      const f = await User.findById(fid);
      if (f && f.is_active) {
        f.userFamily = f.userFamily || [];
        if (!f.userFamily.map(String).includes(String(userId))) {
          f.userFamily.push(userId);
          await f.save();
        }
      }
    }));

    // Append to user's list (avoid duplicates)
    user.userFamily = Array.from(new Set([...(user.userFamily || []).map(String), ...toAdd]));
    await user.save();

    const updated = await User.findById(userId).select('-password_hash').populate({ path: 'userFamily', select: 'id email created_at' });
    return updated.getProfile();
  }

  /**
   * Remove a single family member from user's userFamily and sync reciprocal
   * @param {string} userId
   * @param {string} memberId
   */
  async removeFamilyMember(userId, memberId) {
    const user = await User.findById(userId);
    if (!user || !user.is_active) throw new NotFoundError('User not found');

    // Remove from user
    user.userFamily = (user.userFamily || []).filter(i => String(i) !== String(memberId));
    await user.save();

    // Remove reciprocal link
    const other = await User.findById(memberId);
    if (other) {
      other.userFamily = (other.userFamily || []).filter(i => String(i) !== String(userId));
      await other.save();
    }

    const updated = await User.findById(userId).select('-password_hash').populate({ path: 'userFamily', select: 'id email created_at' });
    return updated.getProfile();
  }
}

module.exports = new UserService();
