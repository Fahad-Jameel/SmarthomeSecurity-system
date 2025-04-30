// models/LightDevice.js
const mongoose = require('mongoose');

const LightDeviceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a device name'],
    trim: true
  },
  type: {
    type: String,
    enum: ['lamp', 'ceiling', 'outdoor', 'strip', 'other'],
    default: 'lamp'
  },
  location: {
    type: String,
    required: [true, 'Please add a location']
  },
  status: {
    type: String,
    enum: ['online', 'offline'],
    default: 'online'
  },
  state: {
    type: String,
    enum: ['on', 'off'],
    default: 'off'
  },
  brightness: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  color: {
    type: String,
    default: '#FFFFFF'
  },
  supportsDimming: {
    type: Boolean,
    default: false
  },
  supportsColor: {
    type: Boolean,
    default: false
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('LightDevice', LightDeviceSchema);