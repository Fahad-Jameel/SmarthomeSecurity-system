const mongoose = require('mongoose');

const AccessCodeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for this access code'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  code: {
    type: String,
    required: [true, 'Please provide an access code'],
    trim: true,
    minlength: [4, 'Code must be at least 4 characters'],
    maxlength: [10, 'Code cannot be more than 10 characters']
  },
  expiry: {
    type: Date,
    required: [true, 'Please provide an expiry date']
  },
  limit: {
    type: Number,
    default: 10,
    min: [1, 'Limit must be at least 1']
  },
  usedCount: {
    type: Number,
    default: 0
  },
  permissions: {
    type: [String],
    enum: ['disarm', 'arm_home', 'arm_away', 'view_cameras'],
    default: ['disarm', 'arm_home']
  },
  lastUsed: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true
  }
});

// Create indexes
AccessCodeSchema.index({ user: 1 });
AccessCodeSchema.index({ code: 1 });

// Auto-update lastUsed when usedCount changes
AccessCodeSchema.pre('save', function(next) {
  if (this.isModified('usedCount')) {
    this.lastUsed = Date.now();
  }
  next();
});

module.exports = mongoose.model('AccessCode', AccessCodeSchema);