const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getCameras,
  getCameraById,
  addCamera,
  updateCamera,
  deleteCamera,
  getCameraRecordings,
  getRecordingById
} = require('../controllers/cameraController');

// @route   GET /api/cameras
// @desc    Get all cameras for the logged in user
// @access  Private
router.get('/', protect, getCameras);

// @route   GET /api/cameras/:id
// @desc    Get camera by ID
// @access  Private
router.get('/:id', protect, getCameraById);

// @route   POST /api/cameras
// @desc    Add a new camera
// @access  Private
router.post('/', protect, addCamera);

// @route   PUT /api/cameras/:id
// @desc    Update a camera
// @access  Private
router.put('/:id', protect, updateCamera);

// @route   DELETE /api/cameras/:id
// @desc    Delete a camera
// @access  Private
router.delete('/:id', protect, deleteCamera);

// @route   GET /api/cameras/:id/recordings
// @desc    Get recordings for a specific camera
// @access  Private
router.get('/:id/recordings', protect, getCameraRecordings);

// @route   GET /api/cameras/recordings/:id
// @desc    Get a specific recording by ID
// @access  Private
router.get('/recordings/:id', protect, getRecordingById);

module.exports = router;