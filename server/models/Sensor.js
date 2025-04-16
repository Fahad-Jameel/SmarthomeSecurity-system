const mongoose = require('mongoose');

const SensorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a sensor name'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Please specify sensor type'],
    enum: ['motion', 'door', 'window', 'camera', 'smoke', 'temperature']
  },
  location: {
    type: String,
    required: [true, 'Please specify sensor location'],
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'triggered', 'offline'],
    default: 'inactive'
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
  zone: {
    type: String,
    default: 'default'
  },
  lastTriggered: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Sensor', SensorSchema);