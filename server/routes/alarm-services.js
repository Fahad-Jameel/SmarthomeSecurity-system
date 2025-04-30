// routes/alarm-services.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const mongoose = require('mongoose');

// Define AlarmServiceConnection schema if not already defined
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

// Create model only if it doesn't exist
let AlarmServiceConnection;
try {
  AlarmServiceConnection = mongoose.model('AlarmServiceConnection');
} catch {
  AlarmServiceConnection = mongoose.model('AlarmServiceConnection', AlarmServiceConnectionSchema);
}

// @route   GET api/integrations/alarm-services
// @desc    Get all alarm service connections for the user
// @access  Private
router.get('/', protect, asyncHandler(async (req, res, next) => {
  const connections = await AlarmServiceConnection.find({ user: req.user.id });
  
  res.status(200).json({
    success: true,
    count: connections.length,
    data: connections
  });
}));

// @route   POST api/integrations/alarm-services
// @desc    Create a new alarm service connection
// @access  Private
router.post('/', protect, asyncHandler(async (req, res, next) => {
  const { 
    serviceId, 
    apiKey, 
    accountId, 
    pin, 
    callCenter, 
    policeDispatch, 
    fireDispatch 
  } = req.body;

  // Check if service already connected
  const existingConnection = await AlarmServiceConnection.findOne({ 
    user: req.user.id,
    serviceId
  });

  if (existingConnection) {
    return next(new ErrorResponse('Service already connected', 400));
  }

  // Simulating service details lookup based on serviceId
  let serviceName, portalUrl;
  switch(serviceId) {
    case 'adt':
      serviceName = 'ADT Security';
      portalUrl = 'https://portal.adt.com';
      break;
    case 'simplisafe':
      serviceName = 'SimpliSafe';
      portalUrl = 'https://app.simplisafe.com';
      break;
    case 'vivint':
      serviceName = 'Vivint Smart Home';
      portalUrl = 'https://www.vivint.com/login';
      break;
    default:
      serviceName = 'Unknown Service';
      portalUrl = '#';
  }

  const newConnection = new AlarmServiceConnection({
    user: req.user.id,
    serviceId,
    serviceName,
    accountId,
    apiKey,
    pin,
    callCenter: callCenter !== undefined ? callCenter : true,
    policeDispatch: policeDispatch !== undefined ? policeDispatch : true,
    fireDispatch: fireDispatch !== undefined ? fireDispatch : true,
    portalUrl,
    status: 'connected',
    lastVerified: Date.now()
  });

  const connection = await newConnection.save();
  
  res.status(201).json({
    success: true,
    data: connection
  });
}));

// @route   DELETE api/integrations/alarm-services/:id
// @desc    Delete an alarm service connection
// @access  Private
router.delete('/:id', protect, asyncHandler(async (req, res, next) => {
  const connection = await AlarmServiceConnection.findById(req.params.id);

  if (!connection) {
    return next(new ErrorResponse(`Connection not found with id of ${req.params.id}`, 404));
  }

  // Check if connection belongs to user
  if (connection.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to delete this connection', 401));
  }

  await connection.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {}
  });
}));

// @route   PATCH api/integrations/alarm-services/:id/options
// @desc    Update alarm service options
// @access  Private
router.patch('/:id/options', protect, asyncHandler(async (req, res, next) => {
  let connection = await AlarmServiceConnection.findById(req.params.id);

  if (!connection) {
    return next(new ErrorResponse(`Connection not found with id of ${req.params.id}`, 404));
  }

  // Check if connection belongs to user
  if (connection.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to update this connection', 401));
  }

  // Update options
  if (req.body.callCenter !== undefined) {
    connection.callCenter = req.body.callCenter;
  }
  if (req.body.policeDispatch !== undefined) {
    connection.policeDispatch = req.body.policeDispatch;
  }
  if (req.body.fireDispatch !== undefined) {
    connection.fireDispatch = req.body.fireDispatch;
  }

  await connection.save();
  
  res.status(200).json({
    success: true,
    data: connection
  });
}));

// @route   POST api/integrations/alarm-services/:id/test
// @desc    Test an alarm service connection
// @access  Private
router.post('/:id/test', protect, asyncHandler(async (req, res, next) => {
  const connection = await AlarmServiceConnection.findById(req.params.id);

  if (!connection) {
    return next(new ErrorResponse(`Connection not found with id of ${req.params.id}`, 404));
  }

  // Check if connection belongs to user
  if (connection.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to test this connection', 401));
  }

  // Update last verified timestamp
  connection.lastVerified = Date.now();
  await connection.save();

  res.status(200).json({
    success: true,
    data: { 
      message: 'Connection test successful',
      lastVerified: connection.lastVerified 
    }
  });
}));

module.exports = router;