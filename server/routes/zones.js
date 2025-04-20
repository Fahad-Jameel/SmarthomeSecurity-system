const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getZones,
  getZoneById,
  createZone,
  updateZone,
  deleteZone,
  assignSensorToZone,
  removeSensorFromZone
} = require('../controllers/zoneController');

// @route   GET /api/zones
// @desc    Get all zones for the logged in user
// @access  Private
router.get('/', protect, getZones);

// @route   GET /api/zones/:id
// @desc    Get zone by ID
// @access  Private
router.get('/:id', protect, getZoneById);

// @route   POST /api/zones
// @desc    Create a new zone
// @access  Private
router.post('/', protect, createZone);

// @route   PUT /api/zones/:id
// @desc    Update a zone
// @access  Private
router.put('/:id', protect, updateZone);

// @route   DELETE /api/zones/:id
// @desc    Delete a zone
// @access  Private
router.delete('/:id', protect, deleteZone);

// @route   POST /api/zones/:id/sensors/:sensorId
// @desc    Assign a sensor to a zone
// @access  Private
router.post('/:id/sensors/:sensorId', protect, assignSensorToZone);

// @route   DELETE /api/zones/:id/sensors/:sensorId
// @desc    Remove a sensor from a zone
// @access  Private
router.delete('/:id/sensors/:sensorId', protect, removeSensorFromZone);

module.exports = router;