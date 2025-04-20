const Camera = require('../models/Camera');
const Recording = require('../models/Recording');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all cameras for the logged in user
// @route   GET /api/cameras
// @access  Private
exports.getCameras = asyncHandler(async (req, res, next) => {
  const cameras = await Camera.find({ user: req.user.id });

  res.status(200).json(cameras);
});

// @desc    Get a camera by ID
// @route   GET /api/cameras/:id
// @access  Private
exports.getCameraById = asyncHandler(async (req, res, next) => {
  const camera = await Camera.findById(req.params.id);

  if (!camera) {
    return next(new ErrorResponse(`Camera not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns the camera
  if (camera.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to access this camera`, 401));
  }

  res.status(200).json(camera);
});

// @desc    Add a new camera
// @route   POST /api/cameras
// @access  Private
exports.addCamera = asyncHandler(async (req, res, next) => {
  // Add user to request body
  req.body.user = req.user.id;

  // Check if the camera already exists
  const existingCamera = await Camera.findOne({ 
    deviceId: req.body.deviceId,
    user: req.user.id 
  });

  if (existingCamera) {
    return next(new ErrorResponse(`Camera with device ID ${req.body.deviceId} already exists`, 400));
  }

  const camera = await Camera.create(req.body);

  res.status(201).json(camera);
});

// @desc    Update a camera
// @route   PUT /api/cameras/:id
// @access  Private
exports.updateCamera = asyncHandler(async (req, res, next) => {
  let camera = await Camera.findById(req.params.id);

  if (!camera) {
    return next(new ErrorResponse(`Camera not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns the camera
  if (camera.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to update this camera`, 401));
  }

  camera = await Camera.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json(camera);
});

// @desc    Delete a camera
// @route   DELETE /api/cameras/:id
// @access  Private
exports.deleteCamera = asyncHandler(async (req, res, next) => {
  const camera = await Camera.findById(req.params.id);

  if (!camera) {
    return next(new ErrorResponse(`Camera not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns the camera
  if (camera.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to delete this camera`, 401));
  }

  // Remove associated recordings
  await Recording.deleteMany({ camera: req.params.id });

  // Remove the camera
  await camera.remove();

  res.status(200).json({ success: true });
});

// @desc    Get recordings for a specific camera
// @route   GET /api/cameras/:id/recordings
// @access  Private
exports.getCameraRecordings = asyncHandler(async (req, res, next) => {
  const camera = await Camera.findById(req.params.id);

  if (!camera) {
    return next(new ErrorResponse(`Camera not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns the camera
  if (camera.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to access this camera's recordings`, 401));
  }

  const recordings = await Recording.find({ camera: req.params.id })
    .sort({ timestamp: -1 }); // Most recent recordings first

  res.status(200).json(recordings);
});

// @desc    Get a specific recording by ID
// @route   GET /api/cameras/recordings/:id
// @access  Private
exports.getRecordingById = asyncHandler(async (req, res, next) => {
  const recording = await Recording.findById(req.params.id).populate('camera');

  if (!recording) {
    return next(new ErrorResponse(`Recording not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns the associated camera
  if (recording.camera.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to access this recording`, 401));
  }

  res.status(200).json(recording);
});