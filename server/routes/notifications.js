const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getNotifications,
  getNotificationById,
  createNotification,
  deleteNotification,
  deleteAllNotifications,
  markAsRead,
  markAllAsRead,
  getNotificationSettings,
  updateNotificationSettings
} = require('../controllers/notificationController');

// @route   GET /api/notifications
// @desc    Get all notifications for the logged in user
// @access  Private
router.get('/', protect, getNotifications);

// @route   GET /api/notifications/:id
// @desc    Get notification by ID
// @access  Private
router.get('/:id', protect, getNotificationById);

// @route   POST /api/notifications
// @desc    Create a new notification
// @access  Private
router.post('/', protect, createNotification);

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
// @access  Private
router.delete('/:id', protect, deleteNotification);

// @route   DELETE /api/notifications
// @desc    Delete all notifications for the user
// @access  Private
router.delete('/', protect, deleteAllNotifications);

// @route   PATCH /api/notifications/:id/read
// @desc    Mark a notification as read
// @access  Private
router.patch('/:id/read', protect, markAsRead);

// @route   PATCH /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.patch('/read-all', protect, markAllAsRead);

// @route   GET /api/notifications/settings
// @desc    Get notification settings for the user
// @access  Private
router.get('/settings', protect, getNotificationSettings);

// @route   POST /api/notifications/settings
// @desc    Update notification settings for the user
// @access  Private
router.post('/settings', protect, updateNotificationSettings);

module.exports = router;