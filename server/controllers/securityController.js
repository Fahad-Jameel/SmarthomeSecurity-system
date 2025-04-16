const SecurityLog = require('../models/SecurityLog');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Change system state (arm/disarm)
// @route   POST /api/security/system
// @access  Private
exports.changeSystemState = asyncHandler(async (req, res, next) => {
  const { state } = req.body;
  
  if (!state || !['arm', 'disarm'].includes(state)) {
    return next(new ErrorResponse('Please provide a valid state (arm/disarm)', 400));
  }

  // Log the state change
  await SecurityLog.create({
    eventType: state,
    description: `System ${state}ed by user`,
    user: req.user.id
  });

  res.status(200).json({
    success: true,
    data: { state }
  });
});

// @desc    Get security logs
// @route   GET /api/security/logs
// @access  Private
exports.getLogs = asyncHandler(async (req, res, next) => {
  const logs = await SecurityLog.find({ user: req.user.id })
    .sort('-timestamp')
    .limit(100)
    .populate('sensor', 'name type location');

  res.status(200).json({
    success: true,
    count: logs.length,
    data: logs
  });
});

// @desc    Trigger alert
// @route   POST /api/security/alert
// @access  Private
exports.triggerAlert = asyncHandler(async (req, res, next) => {
  const { sensorId, description } = req.body;

  const log = await SecurityLog.create({
    eventType: 'alert',
    description: description || 'Manual alert triggered',
    user: req.user.id,
    sensor: sensorId || null
  });

  // Here you would integrate with notification service
  // to send push notifications, SMS, etc.

  res.status(200).json({
    success: true,
    data: log
  });
});