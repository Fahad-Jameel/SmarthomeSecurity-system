const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  eventType: {
    type: String,
    enum: ['arm', 'disarm', 'sensor', 'motion', 'door', 'window', 'system', 'user', 'lock', 'other'],
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  details: {
    type: String,
    trim: true
  },
  source: {
    type: String,
    trim: true
  },
  sourceId: {
    type: mongoose.Schema.Types.ObjectId,
    // This can reference various models (sensor, camera, lock)
  },
  location: {
    type: String,
    trim: true
  },
  read: {
    type: Boolean,
    default: false
  },
  important: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Create index for efficient querying
ActivitySchema.index({ user: 1, timestamp: -1 });
ActivitySchema.index({ eventType: 1, user: 1 });
ActivitySchema.index({ read: 1, user: 1 });

module.exports = mongoose.model('Activity', ActivitySchema);