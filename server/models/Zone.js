const mongoose = require('mongoose');

const ZoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for the zone'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  description: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    default: '#4169E1', // Default color: Royal Blue
    trim: true
  },
  isArmed: {
    type: Boolean,
    default: true
  },
  armingMode: {
    type: String,
    enum: ['all', 'perimeter', 'custom'],
    default: 'all'
  },
  enabled: {
    type: Boolean,
    default: true
  },
  notifications: {
    enabled: {
      type: Boolean,
      default: true
    },
    methods: {
      push: {
        type: Boolean,
        default: true
      },
      email: {
        type: Boolean,
        default: false
      },
      sms: {
        type: Boolean,
        default: false
      }
    }
  },
  sensors: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Sensor'
    }
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for efficient querying
ZoneSchema.index({ user: 1 });

module.exports = mongoose.model('Zone', ZoneSchema);