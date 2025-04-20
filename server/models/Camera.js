const mongoose = require('mongoose');

const CameraSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for the camera'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  deviceId: {
    type: String,
    required: [true, 'Please provide the camera device ID'],
    trim: true,
    unique: true
  },
  location: {
    type: String,
    required: [true, 'Please specify the camera location'],
    trim: true
  },
  isOnline: {
    type: Boolean,
    default: true
  },
  streamUrl: {
    type: String,
    trim: true
  },
  model: {
    type: String,
    trim: true
  },
  firmware: {
    type: String,
    trim: true
  },
  resolution: {
    type: String,
    trim: true,
    default: '1080p'
  },
  motionDetection: {
    type: Boolean,
    default: true
  },
  nightVision: {
    type: Boolean,
    default: true
  },
  recordingEnabled: {
    type: Boolean,
    default: true
  },
  recordingSettings: {
    onMotion: {
      type: Boolean,
      default: true
    },
    continuous: {
      type: Boolean,
      default: false
    },
    retentionDays: {
      type: Number,
      default: 7
    }
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  batteryLevel: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
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

// Virtual for recordings
CameraSchema.virtual('recordings', {
  ref: 'Recording',
  localField: '_id',
  foreignField: 'camera',
  justOne: false
});

// Cascade delete recordings when a camera is deleted
CameraSchema.pre('remove', async function(next) {
  await this.model('Recording').deleteMany({ camera: this._id });
  next();
});

module.exports = mongoose.model('Camera', CameraSchema);