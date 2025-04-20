const mongoose = require('mongoose');

const RecordingSchema = new mongoose.Schema({
  camera: {
    type: mongoose.Schema.ObjectId,
    ref: 'Camera',
    required: true
  },
  fileName: {
    type: String,
    required: true,
    trim: true
  },
  fileUrl: {
    type: String,
    required: true,
    trim: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  duration: {
    type: Number, // Duration in seconds
    required: true
  },
  resolution: {
    type: String,
    trim: true,
    default: '1080p'
  },
  trigger: {
    type: String,
    enum: ['motion', 'manual', 'scheduled'],
    default: 'motion'
  },
  hasMotion: {
    type: Boolean,
    default: false
  },
  thumbnail: {
    type: String,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  watched: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Recording', RecordingSchema);