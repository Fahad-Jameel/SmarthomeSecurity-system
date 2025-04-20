const Notification = require('../models/Notification');
const NotificationSettings = require('../models/NotificationSettings');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all notifications for the logged in user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = asyncHandler(async (req, res, next) => {
  // Get notifications for this user, newest first
  const notifications = await Notification.find({ user: req.user.id })
    .sort({ timestamp: -1 });
  
  // Calculate unread count
  const unreadCount = notifications.filter(notif => !notif.read).length;

  res.status(200).json({
    success: true,
    count: notifications.length,
    unreadCount,
    data: notifications
  });
});

// @desc    Get notification by ID
// @route   GET /api/notifications/:id
// @access  Private
exports.getNotificationById = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new ErrorResponse(`Notification not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns the notification
  if (notification.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to access this notification`, 401));
  }

  res.status(200).json({
    success: true,
    data: notification
  });
});

// @desc    Create a new notification
// @route   POST /api/notifications
// @access  Private
exports.createNotification = asyncHandler(async (req, res, next) => {
  // Check if notification should be sent based on user's settings
  // In a real implementation, you'd check quiet hours, notification preferences, etc.
  
  // Add user to request body
  req.body.user = req.user.id;
  
  // Create the notification
  const notification = await Notification.create(req.body);
  
  res.status(201).json({
    success: true,
    data: notification
  });
});

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new ErrorResponse(`Notification not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns the notification
  if (notification.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to delete this notification`, 401));
  }

  await notification.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Delete all notifications for the user
// @route   DELETE /api/notifications
// @access  Private
exports.deleteAllNotifications = asyncHandler(async (req, res, next) => {
  await Notification.deleteMany({ user: req.user.id });

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Mark a notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
exports.markAsRead = asyncHandler(async (req, res, next) => {
  let notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new ErrorResponse(`Notification not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns the notification
  if (notification.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to update this notification`, 401));
  }

  notification = await Notification.findByIdAndUpdate(
    req.params.id,
    { read: true },
    { new: true }
  );

  res.status(200).json({
    success: true,
    data: notification
  });
});

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
exports.markAllAsRead = asyncHandler(async (req, res, next) => {
  await Notification.updateMany(
    { user: req.user.id, read: false },
    { read: true }
  );

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get notification settings for the user
// @route   GET /api/notifications/settings
// @access  Private
exports.getNotificationSettings = asyncHandler(async (req, res, next) => {
  // Find or create settings for this user
  let settings = await NotificationSettings.findOne({ user: req.user.id });
  
  if (!settings) {
    // Create default settings if none exist
    settings = await NotificationSettings.create({
      user: req.user.id
    });
  }
  
  res.status(200).json({
    success: true,
    data: settings
  });
});

// @desc    Update notification settings for the user
// @route   POST /api/notifications/settings
// @access  Private
exports.updateNotificationSettings = asyncHandler(async (req, res, next) => {
  // Find or create settings for this user
  let settings = await NotificationSettings.findOne({ user: req.user.id });
  
  if (!settings) {
    // Create settings with the provided values
    settings = await NotificationSettings.create({
      ...req.body,
      user: req.user.id
    });
  } else {
    // Update existing settings
    settings = await NotificationSettings.findOneAndUpdate(
      { user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
  }
  
  res.status(200).json({
    success: true,
    data: settings
  });
});