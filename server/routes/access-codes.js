const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getAccessCodes,
  getAccessCodeById,
  generateAccessCode,
  createAccessCode,
  updateAccessCode,
  deleteAccessCode,
  validateAccessCode
} = require('../controllers/accessCodeController');

// @route   GET /api/access-codes
// @desc    Get all access codes for the logged in user
// @access  Private
router.get('/', protect, getAccessCodes);

// @route   GET /api/access-codes/:id
// @desc    Get access code by ID
// @access  Private
router.get('/:id', protect, getAccessCodeById);

// @route   POST /api/access-codes/generate
// @desc    Generate a new access code (but don't save it yet)
// @access  Private
router.post('/generate', protect, generateAccessCode);

// @route   POST /api/access-codes
// @desc    Create a new access code
// @access  Private
router.post('/', protect, createAccessCode);

// @route   PUT /api/access-codes/:id
// @desc    Update an access code
// @access  Private
router.put('/:id', protect, updateAccessCode);

// @route   DELETE /api/access-codes/:id
// @desc    Delete an access code
// @access  Private
router.delete('/:id', protect, deleteAccessCode);

// @route   POST /api/access-codes/validate
// @desc    Validate an access code
// @access  Public
router.post('/validate', validateAccessCode);

module.exports = router;