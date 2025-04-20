const Activity = require('../models/Activity');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all activities for the logged in user
// @route   GET /api/activities
// @access  Private
exports.getActivities = asyncHandler(async (req, res, next) => {
  // Parse query parameters
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  // Build query object
  const queryObj = { user: req.user.id };

  // Filter by event type if provided
  if (req.query.eventType && req.query.eventType !== 'all') {
    queryObj.eventType = req.query.eventType;
  }

  // Filter by date range if provided
  if (req.query.startDate && req.query.endDate) {
    queryObj.timestamp = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate)
    };
  }

  // Search by description if provided
  if (req.query.search) {
    queryObj.$or = [
      { description: { $regex: req.query.search, $options: 'i' } },
      { details: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  // Execute query with pagination
  const total = await Activity.countDocuments(queryObj);
  
  const activities = await Activity.find(queryObj)
    .sort({ timestamp: -1 }) // Most recent first
    .skip(startIndex)
    .limit(limit);

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    total,
    pagination,
    activities
  });
});

// @desc    Get activity by ID
// @route   GET /api/activities/:id
// @access  Private
exports.getActivityById = asyncHandler(async (req, res, next) => {
  const activity = await Activity.findById(req.params.id);

  if (!activity) {
    return next(new ErrorResponse(`Activity not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns the activity
  if (activity.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to access this activity`, 401));
  }

  res.status(200).json({
    success: true,
    data: activity
  });
});

// @desc    Create a new activity log entry
// @route   POST /api/activities
// @access  Private
exports.createActivity = asyncHandler(async (req, res, next) => {
  // Add user to request body
  req.body.user = req.user.id;

  const activity = await Activity.create(req.body);

  res.status(201).json({
    success: true,
    data: activity
  });
});

// @desc    Delete an activity log entry
// @route   DELETE /api/activities/:id
// @access  Private
exports.deleteActivity = asyncHandler(async (req, res, next) => {
  const activity = await Activity.findById(req.params.id);

  if (!activity) {
    return next(new ErrorResponse(`Activity not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns the activity
  if (activity.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to delete this activity`, 401));
  }

  await activity.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Delete all activity log entries for the user
// @route   DELETE /api/activities
// @access  Private
exports.deleteAllActivities = asyncHandler(async (req, res, next) => {
  await Activity.deleteMany({ user: req.user.id });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Mark an activity as read
// @route   PATCH /api/activities/:id/read
// @access  Private
exports.markActivityAsRead = asyncHandler(async (req, res, next) => {
  let activity = await Activity.findById(req.params.id);

  if (!activity) {
    return next(new ErrorResponse(`Activity not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns the activity
  if (activity.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to update this activity`, 401));
  }

  activity = await Activity.findByIdAndUpdate(
    req.params.id,
    { read: true },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: activity
  });
});

// @desc    Mark all activities as read
// @route   PATCH /api/activities/read-all
// @access  Private
exports.markAllActivitiesAsRead = asyncHandler(async (req, res, next) => {
  await Activity.updateMany(
    { user: req.user.id, read: false },
    { read: true }
  );

  res.status(200).json({
    success: true,
    data: {}
  });
});