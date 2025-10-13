/**
 * User Model
 * Mongoose schema for user entity
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ],
  },
  password_hash: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
    required: true,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
  last_login: {
    type: Date,
    default: null,
  },
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.password_hash;
      return ret;
    }
  },
  toObject: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

/**
 * Indexes
 */
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ is_active: 1 });
userSchema.index({ created_at: -1 });

/**
 * Pre-save middleware to hash password
 */
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password_hash')) return next();

  try {
    // Hash password with cost of 10
    this.password_hash = await bcrypt.hash(this.password_hash, 10);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Instance Methods
 */

// Check if provided password matches the user's password
userSchema.methods.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password_hash);
};

// Update last login timestamp
userSchema.methods.updateLastLogin = async function() {
  this.last_login = new Date();
  return await this.save();
};

// Get user profile (without sensitive data)
userSchema.methods.getProfile = function() {
  const obj = this.toObject();
  delete obj.password_hash;
  return obj;
};

// Check if user is admin
userSchema.methods.isAdmin = function() {
  return this.role === 'admin';
};

// Activate user account
userSchema.methods.activate = async function() {
  this.is_active = true;
  return await this.save();
};

// Deactivate user account
userSchema.methods.deactivate = async function() {
  this.is_active = false;
  return await this.save();
};

/**
 * Static Methods
 */

// Find user by email (active users only)
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ 
    email: email.toLowerCase(), 
    is_active: true 
  });
};

// Find active user by ID
userSchema.statics.findActiveById = function(id) {
  return this.findOne({ 
    _id: id, 
    is_active: true 
  }).select('-password_hash');
};

// Get all active users with pagination
userSchema.statics.findActiveUsers = async function(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  
  const [users, total] = await Promise.all([
    this.find({ is_active: true })
      .select('-password_hash')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    this.countDocuments({ is_active: true })
  ]);

  return {
    rows: users,
    count: total
  };
};

// Find user by ID including inactive users (for admin operations)
userSchema.statics.findByIdIncludeInactive = function(id) {
  return this.findById(id);
};

// Search users by email pattern
userSchema.statics.searchByEmail = function(emailPattern, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const regex = new RegExp(emailPattern, 'i');
  
  return this.find({ 
    email: regex, 
    is_active: true 
  })
    .select('-password_hash')
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(limit);
};

// Get user statistics
userSchema.statics.getStats = async function() {
  const [totalUsers, activeUsers, adminUsers, recentUsers] = await Promise.all([
    this.countDocuments(),
    this.countDocuments({ is_active: true }),
    this.countDocuments({ role: 'admin', is_active: true }),
    this.countDocuments({ 
      created_at: { 
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
      } 
    })
  ]);

  return {
    total: totalUsers,
    active: activeUsers,
    admins: adminUsers,
    recent: recentUsers,
    inactive: totalUsers - activeUsers
  };
};

/**
 * Virtual for full name (if we add firstName and lastName later)
 */
userSchema.virtual('fullName').get(function() {
  return `${this.firstName || ''} ${this.lastName || ''}`.trim() || this.email;
});

const User = mongoose.model('User', userSchema);

module.exports = User;
