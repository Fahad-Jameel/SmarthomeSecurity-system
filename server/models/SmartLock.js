const mongoose = require('mongoose');

const SmartLockSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for the smart lock'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  deviceId: {
    type: String,
    required: [true, 'Please provide the device ID'],
    trim: true
  },
  model: {
    type: String,
    trim: true
  },
  manufacturer: {
    type: String,
    trim: true
  },
  firmware: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    enum: ['locked', 'unlocked', 'jammed', 'offline'],
    default: 'locked'
  },
  batteryLevel: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  autoLock: {
    type: Boolean,
    default: false
  },
  autoLockDelay: {
    type: Number, // in seconds
    default: 30
  },
  armOnLock: {
    type: Boolean,
    default: false
  },
  notifyOnUnlock: {
    type: Boolean,
    default: false
  },
  location: {
    type: String,
    trim: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  connected: {
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
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for lock events
SmartLockSchema.virtual('events', {
  ref: 'LockEvent',
  localField: '_id',
  foreignField: 'lock',
  justOne: false
});

// Cascade delete lock events when a smart lock is deleted
SmartLockSchema.pre('remove', async function(next) {
  await this.model('LockEvent').deleteMany({ lock: this._id });
  next();
});

// Create indexes for efficient querying
SmartLockSchema.index({ user: 1 });
SmartLockSchema.index({ deviceId: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('SmartLock', SmartLockSchema);