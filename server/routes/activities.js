const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getActivities,
  getActivityById,
  createActivity,
  deleteActivity,
  deleteAllActivities,
  markActivityAsRead,
  markAllActivitiesAsRead
} = require('../controllers/activityController');

// @route   GET /api/activities
// @desc    Get all activities for the logged in user
// @access  Private
router.get('/', protect, getActivities);

// @route   GET /api/activities/:id
// @desc    Get activity by ID
// @access  Private
router.get('/:id', protect, getActivityById);

// @route   POST /api/activities
// @desc    Create a new activity log entry
// @access  Private
router.post('/', protect, createActivity);

// @route   DELETE /api/activities/:id
// @desc    Delete an activity log entry
// @access  Private
router.delete('/:id', protect, deleteActivity);

// @route   DELETE /api/activities
// @desc    Delete all activity log entries for the user
// @access  Private
router.delete('/', protect, deleteAllActivities);

// @route   PATCH /api/activities/:id/read
// @desc    Mark an activity as read
// @access  Private
router.patch('/:id/read', protect, markActivityAsRead);

// @route   PATCH /api/activities/read-all
// @desc    Mark all activities as read
// @access  Private
router.patch('/read-all', protect, markAllActivitiesAsRead);

module.exports = router;