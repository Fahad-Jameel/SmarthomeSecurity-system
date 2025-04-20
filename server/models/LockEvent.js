const mongoose = require('mongoose');

const LockEventSchema = new mongoose.Schema({
  lock: {
    type: mongoose.Schema.ObjectId,
    ref: 'SmartLock',
    required: true
  },
  eventType: {
    type: String,
    enum: ['lock', 'unlock', 'autolock', 'autounlock', 'error', 'jammed', 'battery_low', 'offline', 'online'],
    required: true
  },
  method: {
    type: String,
    enum: ['app', 'keypad', 'key', 'auto', 'system', 'unknown'],
    default: 'unknown'
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    // Not required as some events may be automatic or triggered by non-users
  },
  accessCode: {
    type: mongoose.Schema.ObjectId,
    ref: 'AccessCode',
    // Only applicable for keypad events
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  details: {
    type: String,
    trim: true
  },
  batteryLevel: {
    type: Number,
    min: 0,
    max: 100
  }
});

// Create indexes for efficient querying
LockEventSchema.index({ lock: 1, timestamp: -1 });
LockEventSchema.index({ user: 1 });

module.exports = mongoose.model('LockEvent', LockEventSchema);