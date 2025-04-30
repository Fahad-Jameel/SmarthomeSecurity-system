// models/AlarmServiceConnection.js
const mongoose = require('mongoose');

const AlarmServiceConnectionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  serviceId: {
    type: String,
    required: true
  },
  serviceName: {
    type: String,
    required: true
  },
  accountId: {
    type: String,
    required: true
  },
  apiKey: {
    type: String,
    required: true
  },
  pin: {
    type: String,
    required: true
  },
  callCenter: {
    type: Boolean,
    default: true
  },
  policeDispatch: {
    type: Boolean,
    default: true
  },
  fireDispatch: {
    type: Boolean,
    default: true
  },
  portalUrl: {
    type: String
  },
  status: {
    type: String,
    enum: ['connected', 'disconnected', 'pending'],
    default: 'pending'
  },
  lastVerified: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AlarmServiceConnection', AlarmServiceConnectionSchema);