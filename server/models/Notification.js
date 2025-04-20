const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a notification title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Please provide a notification message'],
    trim: true
  },
  type: {
    type: String,
    enum: ['info', 'alert', 'success', 'warning'],
    default: 'info'
  },
  read: {
    type: Boolean,
    default: false
  },
  important: {
    type: Boolean,
    default: false
  },
  source: {
    type: String,
    trim: true,
    enum: ['security', 'sensor', 'camera', 'lock', 'zone', 'system', 'other'],
    default: 'system'
  },
  sourceId: {
    type: mongoose.Schema.Types.ObjectId,
    // This can reference various models (sensor, camera, lock)
  },
  details: {
    type: String,
    trim: true
  },
  actionUrl: {
    type: String,
    trim: true
  },
  actionLabel: {
    type: String,
    trim: true
  },
  icon: {
    type: String,
    trim: true
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

// Create indexes for efficient querying
NotificationSchema.index({ user: 1, timestamp: -1 });
NotificationSchema.index({ read: 1, user: 1 });
NotificationSchema.index({ type: 1, user: 1 });

module.exports = mongoose.model('Notification', NotificationSchema);