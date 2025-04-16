const mongoose = require('mongoose');

const SecurityLogSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: [true, 'Please specify event type'],
    enum: ['arm', 'disarm', 'trigger', 'alert', 'system']
  },
  description: {
    type: String,
    required: [true, 'Please add event description']
  },
  source: {
    type: String
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  sensor: {
    type: mongoose.Schema.ObjectId,
    ref: 'Sensor'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SecurityLog', SecurityLogSchema);