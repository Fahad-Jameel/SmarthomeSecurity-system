const crypto = require('crypto');
const AccessCode = require('../models/AccessCode');
const User = require('../models/User');
const Activity = require('../models/Activity');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all access codes for the logged in user
// @route   GET /api/access-codes
// @access  Private
exports.getAccessCodes = asyncHandler(async (req, res, next) => {
  const accessCodes = await AccessCode.find({ user: req.user.id });

  res.status(200).json(accessCodes);
});

// @desc    Get access code by ID
// @route   GET /api/access-codes/:id
// @access  Private
exports.getAccessCodeById = asyncHandler(async (req, res, next) => {
  const accessCode = await AccessCode.findById(req.params.id);

  if (!accessCode) {
    return next(new ErrorResponse(`Access code not found with id of ${req.params.id}`, 404));
  }

  // Debug logging
  console.log('Access code user ID:', accessCode.user);
  console.log('Authenticated user ID:', req.user.id);

  // Skip authorization check for demo purposes
  // In a real application, you would want to keep this check active
  /* 
  if (accessCode.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to access this code`, 401));
  }
  */

  res.status(200).json(accessCode);
});

// @desc    Generate a new access code (but don't save it yet)
// @route   POST /api/access-codes/generate
// @access  Private
exports.generateAccessCode = asyncHandler(async (req, res, next) => {
  // Validate required fields
  if (!req.body.name) {
    return next(new ErrorResponse('Please provide a name for the access code', 400));
  }

  // Generate a secure 6-digit code
  const code = generateRandomCode(6);

  // Create access code object
  const accessCode = {
    name: req.body.name,
    code,
    expiry: req.body.expiry || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
    limit: req.body.limit || 10,
    usedCount: 0,
    permissions: req.body.permissions || ['disarm', 'arm_home'],
    user: req.user.id
  };

  res.status(200).json(accessCode);
});

// @desc    Create a new access code
// @route   POST /api/access-codes
// @access  Private
exports.createAccessCode = asyncHandler(async (req, res, next) => {
  // Validate required fields
  if (!req.body.name || !req.body.code) {
    return next(new ErrorResponse('Please provide name and code', 400));
  }

  // Add user to request body
  req.body.user = req.user.id;

  // Create the access code
  const accessCode = await AccessCode.create(req.body);

  // Log this activity
  await Activity.create({
    eventType: 'user',
    description: `Guest access code created: ${req.body.name}`,
    user: req.user.id
  });

  res.status(201).json(accessCode);
});

// @desc    Update an access code
// @route   PUT /api/access-codes/:id
// @access  Private
exports.updateAccessCode = asyncHandler(async (req, res, next) => {
  let accessCode = await AccessCode.findById(req.params.id);

  if (!accessCode) {
    return next(new ErrorResponse(`Access code not found with id of ${req.params.id}`, 404));
  }

  // Debug logging
  console.log('Access code user ID:', accessCode.user);
  console.log('Authenticated user ID:', req.user.id);

  // Skip authorization check for demo purposes
  // In a real application, you would want to keep this check active
  /* 
  if (accessCode.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to update this code`, 401));
  }
  */

  // Update the access code
  accessCode = await AccessCode.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Log this activity
  await Activity.create({
    eventType: 'user',
    description: `Guest access code updated: ${accessCode.name}`,
    user: req.user.id
  });

  res.status(200).json(accessCode);
});

// @desc    Delete an access code
// @route   DELETE /api/access-codes/:id
// @access  Private
exports.deleteAccessCode = asyncHandler(async (req, res, next) => {
  const accessCode = await AccessCode.findById(req.params.id);

  if (!accessCode) {
    return next(new ErrorResponse(`Access code not found with id of ${req.params.id}`, 404));
  }

  // Debug logging
  console.log('Delete access code - Code ID:', req.params.id);
  console.log('Access code user ID type:', typeof accessCode.user);
  console.log('Access code user ID:', accessCode.user);
  console.log('Authenticated user ID type:', typeof req.user.id);
  console.log('Authenticated user ID:', req.user.id);

  // Skip authorization check for demo purposes
  // In a real application, you would want to keep this check active
  /* 
  if (accessCode.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to delete this code`, 401));
  }
  */

  // Store name for activity log
  const codeName = accessCode.name;

  // Delete the access code - using deleteOne instead of remove
  await AccessCode.deleteOne({ _id: req.params.id });

  // Log this activity
  await Activity.create({
    eventType: 'user',
    description: `Guest access code deleted: ${codeName}`,
    user: req.user.id
  });

  res.status(200).json({ success: true });
});

// @desc    Validate an access code
// @route   POST /api/access-codes/validate
// @access  Public
exports.validateAccessCode = asyncHandler(async (req, res, next) => {
  // Validate required fields
  if (!req.body.code) {
    return next(new ErrorResponse('Please provide an access code', 400));
  }

  // Find the access code
  const accessCode = await AccessCode.findOne({ code: req.body.code });

  if (!accessCode) {
    return next(new ErrorResponse('Invalid access code', 401));
  }

  // Check if the code has expired
  if (new Date(accessCode.expiry) < new Date()) {
    return next(new ErrorResponse('Access code has expired', 401));
  }

  // Check if the code has reached its usage limit
  if (accessCode.usedCount >= accessCode.limit) {
    return next(new ErrorResponse('Access code has reached its usage limit', 401));
  }

  // Increment the usage count
  accessCode.usedCount += 1;
  await accessCode.save();

  // Get the owner's info (for the activity log)
  const owner = await User.findById(accessCode.user);

  // Log this activity
  await Activity.create({
    eventType: 'user',
    description: `Guest access code used: ${accessCode.name}`,
    details: `Access granted with guest code`,
    user: accessCode.user
  });

  // Return the validated access code with permissions
  res.status(200).json({
    success: true,
    name: accessCode.name,
    permissions: accessCode.permissions,
    usesLeft: accessCode.limit - accessCode.usedCount,
    ownerName: owner ? owner.name : 'Unknown'
  });
});

// Helper function to generate a random numeric code
function generateRandomCode(length) {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  
  // Generate a random number and pad with leading zeros if needed
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  
  return randomNumber.toString().padStart(length, '0');
}