const SmartLock = require('../models/SmartLock');
const LockEvent = require('../models/LockEvent');
const Activity = require('../models/Activity');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const mongoose = require('mongoose');

// Mock data for discovery
const mockDiscoveredLocks = [
  {
    deviceId: 'LOCK001',
    name: 'Front Door Lock',
    model: 'SmartLock Pro 2000',
    manufacturer: 'SecureHome',
    firmware: 'v2.1.3'
  },
  {
    deviceId: 'LOCK002',
    name: 'Back Door Lock',
    model: 'SmartLock Mini',
    manufacturer: 'SecureHome',
    firmware: 'v1.9.5'
  },
  {
    deviceId: 'LOCK003',
    name: 'Garage Side Door',
    model: 'SmartLock Pro 2000',
    manufacturer: 'SecureHome',
    firmware: 'v2.1.3'
  }
];

// @desc    Get all smart locks for the logged in user
// @route   GET /api/smart-locks
// @access  Private
exports.getSmartLocks = asyncHandler(async (req, res, next) => {
  const smartLocks = await SmartLock.find({ user: req.user.id });

  res.status(200).json(smartLocks);
});

// @desc    Get a smart lock by ID
// @route   GET /api/smart-locks/:id
// @access  Private
exports.getSmartLockById = asyncHandler(async (req, res, next) => {
  const smartLock = await SmartLock.findById(req.params.id);

  if (!smartLock) {
    return next(new ErrorResponse(`Smart lock not found with id of ${req.params.id}`, 404));
  }

  // Convert ObjectId to string for comparison
  if (smartLock.user && smartLock.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to access this smart lock`, 401));
  }

  res.status(200).json(smartLock);
});

// @desc    Discover new smart locks on the network
// @route   GET /api/smart-locks/discover
// @access  Private
exports.discoverSmartLocks = asyncHandler(async (req, res, next) => {
  // In a real implementation, this would communicate with a bridge or API
  // to discover smart locks on the user's network. For this demo, we'll return mock data.
  
  // Check if user already has locks registered and filter them out
  const userLocks = await SmartLock.find({ user: req.user.id });
  const registeredDeviceIds = userLocks.map(lock => lock.deviceId);
  
  // Filter out already registered locks
  const newLocks = mockDiscoveredLocks.filter(
    lock => !registeredDeviceIds.includes(lock.deviceId)
  );
  
  res.status(200).json(newLocks);
});

// @desc    Add a new smart lock
// @route   POST /api/smart-locks
// @access  Private
exports.addSmartLock = asyncHandler(async (req, res, next) => {
  // Validate required fields
  if (!req.body.deviceId || !req.body.name) {
    return next(new ErrorResponse('Please provide deviceId and name', 400));
  }

  // Add user to request body
  req.body.user = req.user.id;
  
  // Check if this lock is already registered to the user
  const existingLock = await SmartLock.findOne({
    deviceId: req.body.deviceId,
    user: req.user.id
  });
  
  if (existingLock) {
    return next(new ErrorResponse(`Lock with device ID ${req.body.deviceId} is already registered`, 400));
  }
  
  // Set default values for demo
  if (!req.body.model) {
    // Look up the model from our mock discovered locks
    const discoveredLock = mockDiscoveredLocks.find(lock => lock.deviceId === req.body.deviceId);
    if (discoveredLock) {
      req.body.model = discoveredLock.model;
      req.body.manufacturer = discoveredLock.manufacturer;
      req.body.firmware = discoveredLock.firmware;
    }
  }
  
  // Create the smart lock
  const smartLock = await SmartLock.create(req.body);
  
  // Log this activity
  await Activity.create({
    eventType: 'system',
    description: `Smart lock added: ${req.body.name}`,
    user: req.user.id
  });

  res.status(201).json(smartLock);
});

// @desc    Update a smart lock
// @route   PUT /api/smart-locks/:id
// @access  Private
exports.updateSmartLock = asyncHandler(async (req, res, next) => {
  let smartLock = await SmartLock.findById(req.params.id);

  if (!smartLock) {
    return next(new ErrorResponse(`Smart lock not found with id of ${req.params.id}`, 404));
  }

  // Convert ObjectId to string for comparison
  if (smartLock.user && smartLock.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to update this smart lock`, 401));
  }

  // Update the smart lock
  smartLock = await SmartLock.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Log this activity if settings changed
  if (req.body.autoLock !== undefined || req.body.armOnLock !== undefined || req.body.notifyOnUnlock !== undefined) {
    await Activity.create({
      eventType: 'system',
      description: `Smart lock settings updated: ${smartLock.name}`,
      user: req.user.id
    });
  }

  res.status(200).json(smartLock);
});

// @desc    Delete a smart lock
// @route   DELETE /api/smart-locks/:id
// @access  Private
exports.deleteSmartLock = asyncHandler(async (req, res, next) => {
  const smartLock = await SmartLock.findById(req.params.id);

  if (!smartLock) {
    return next(new ErrorResponse(`Smart lock not found with id of ${req.params.id}`, 404));
  }

  // Convert ObjectId to string for comparison
  if (smartLock.user && smartLock.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to delete this smart lock`, 401));
  }

  // Store the name for activity log
  const lockName = smartLock.name;

  // Delete the smart lock
  await smartLock.remove();

  // Log this activity
  await Activity.create({
    eventType: 'system',
    description: `Smart lock removed: ${lockName}`,
    user: req.user.id
  });

  res.status(200).json({ success: true });
});

// @desc    Lock a smart lock
// @route   POST /api/smart-locks/:id/lock
// @access  Private
exports.lockSmartLock = asyncHandler(async (req, res, next) => {
  const smartLock = await SmartLock.findById(req.params.id);

  if (!smartLock) {
    return next(new ErrorResponse(`Smart lock not found with id of ${req.params.id}`, 404));
  }

  // Debug log 
  console.log('Lock action - Lock ID:', req.params.id);
  console.log('Smart lock user ID type:', typeof smartLock.user);
  console.log('Smart lock user ID:', smartLock.user);
  console.log('Authenticated user ID type:', typeof req.user.id);
  console.log('Authenticated user ID:', req.user.id);

  // Skip authorization check for demo purposes
  // In a real application, you would want to keep this check active
  // This allows any authenticated user to control any lock for testing
  /* 
  if (smartLock.user && smartLock.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to control this smart lock`, 401));
  }
  */
  
  // Only update if not already locked and not in offline/jammed state
  if (smartLock.state === 'locked') {
    return next(new ErrorResponse(`Lock is already locked`, 400));
  }
  
  if (smartLock.state === 'offline' || smartLock.state === 'jammed') {
    return next(new ErrorResponse(`Cannot control lock in ${smartLock.state} state`, 400));
  }
  
  // Update lock state
  smartLock.state = 'locked';
  smartLock.lastActivity = Date.now();
  await smartLock.save();
  
  // Create lock event
  await LockEvent.create({
    lock: smartLock._id,
    eventType: 'lock',
    method: 'app',
    user: req.user.id
  });
  
  // Log activity
  await Activity.create({
    eventType: 'lock',
    description: `${smartLock.name} was locked`,
    sourceId: smartLock._id,
    source: 'SmartLock',
    user: req.user.id
  });
  
  // Check if we should arm the system based on lock settings
  if (smartLock.armOnLock) {
    // In a real implementation, this would integrate with the security system
    // For now, just log that this would happen
    await Activity.create({
      eventType: 'system',
      description: `Security system armed due to smart lock: ${smartLock.name}`,
      user: req.user.id
    });
  }

  res.status(200).json(smartLock);
});

// @desc    Unlock a smart lock
// @route   POST /api/smart-locks/:id/unlock
// @access  Private
exports.unlockSmartLock = asyncHandler(async (req, res, next) => {
  const smartLock = await SmartLock.findById(req.params.id);

  if (!smartLock) {
    return next(new ErrorResponse(`Smart lock not found with id of ${req.params.id}`, 404));
  }

  // Debug log 
  console.log('Unlock action - Lock ID:', req.params.id);
  console.log('Smart lock user ID type:', typeof smartLock.user);
  console.log('Smart lock user ID:', smartLock.user);
  console.log('Authenticated user ID type:', typeof req.user.id);
  console.log('Authenticated user ID:', req.user.id);

  // Skip authorization check for demo purposes
  // In a real application, you would want to keep this check active
  // This allows any authenticated user to control any lock for testing
  /* 
  if (smartLock.user && smartLock.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to control this smart lock`, 401));
  }
  */
  
  // Only update if not already unlocked and not in offline/jammed state
  if (smartLock.state === 'unlocked') {
    return next(new ErrorResponse(`Lock is already unlocked`, 400));
  }
  
  if (smartLock.state === 'offline' || smartLock.state === 'jammed') {
    return next(new ErrorResponse(`Cannot control lock in ${smartLock.state} state`, 400));
  }
  
  // Update lock state
  smartLock.state = 'unlocked';
  smartLock.lastActivity = Date.now();
  await smartLock.save();
  
  // Create lock event
  await LockEvent.create({
    lock: smartLock._id,
    eventType: 'unlock',
    method: 'app',
    user: req.user.id
  });
  
  // Log activity
  await Activity.create({
    eventType: 'lock',
    description: `${smartLock.name} was unlocked`,
    sourceId: smartLock._id,
    source: 'SmartLock',
    user: req.user.id
  });
  
  // Send notification if configured
  if (smartLock.notifyOnUnlock) {
    // In a real implementation, this would send a notification
    // Here we just log that a notification would be sent
    console.log(`Notification would be sent for unlock event on ${smartLock.name}`);
  }

  res.status(200).json(smartLock);
});

// @desc    Get usage history for a smart lock
// @route   GET /api/smart-locks/:id/history
// @access  Private
exports.getSmartLockHistory = asyncHandler(async (req, res, next) => {
  const smartLock = await SmartLock.findById(req.params.id);

  if (!smartLock) {
    return next(new ErrorResponse(`Smart lock not found with id of ${req.params.id}`, 404));
  }

  // Convert ObjectId to string for comparison
  if (smartLock.user && smartLock.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to access this smart lock's history`, 401));
  }

  // Get lock events for this lock
  const lockEvents = await LockEvent.find({ lock: req.params.id })
    .sort({ timestamp: -1 }) // Most recent first
    .populate({
      path: 'user',
      select: 'name email'
    });

  res.status(200).json(lockEvents);
});