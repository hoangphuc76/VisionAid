/**
 * Refresh Token Model
 * Mongoose schema and model for refresh tokens
 */

const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  expires_at: {
    type: Date,
    required: true,
    index: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  is_revoked: {
    type: Boolean,
    default: false,
  },
  revoked_at: {
    type: Date,
    default: null,
  },
});

// Index for automatic cleanup of expired tokens
refreshTokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

// Instance methods
refreshTokenSchema.methods = {
  /**
   * Check if token is expired
   * @returns {boolean}
   */
  isExpired() {
    return this.expires_at < new Date();
  },

  /**
   * Revoke the token
   */
  async revoke() {
    this.is_revoked = true;
    this.revoked_at = new Date();
    return await this.save();
  },
};

// Static methods
refreshTokenSchema.statics = {
  /**
   * Find token by token string
   * @param {string} token - Refresh token string
   * @returns {Object} RefreshToken document
   */
  async findByToken(token) {
    return await this.findOne({ token, is_revoked: false });
  },

  /**
   * Find all tokens for a user
   * @param {string} userId - User ID
   * @returns {Array} Array of RefreshToken documents
   */
  async findByUserId(userId) {
    return await this.find({ 
      user_id: userId, 
      is_revoked: false,
      expires_at: { $gt: new Date() },
    }).sort({ created_at: -1 });
  },

  /**
   * Revoke all tokens for a user
   * @param {string} userId - User ID
   * @returns {Object} Update result
   */
  async revokeAllForUser(userId) {
    return await this.updateMany(
      { user_id: userId, is_revoked: false },
      { 
        $set: { 
          is_revoked: true, 
          revoked_at: new Date(),
        },
      }
    );
  },

  /**
   * Clean up expired tokens (manual cleanup, though TTL index handles this automatically)
   * @returns {Object} Delete result
   */
  async cleanupExpired() {
    return await this.deleteMany({
      expires_at: { $lt: new Date() },
    });
  },

  /**
   * Create a new refresh token
   * @param {Object} tokenData - Token data
   * @returns {Object} RefreshToken document
   */
  async createToken(tokenData) {
    const refreshToken = new this(tokenData);
    return await refreshToken.save();
  },
};

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

module.exports = RefreshToken;
