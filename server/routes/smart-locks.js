const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getSmartLocks,
  getSmartLockById,
  discoverSmartLocks,
  addSmartLock,
  updateSmartLock,
  deleteSmartLock,
  lockSmartLock,
  unlockSmartLock,
  getSmartLockHistory
} = require('../controllers/smartLockController');

// @route   GET /api/smart-locks/discover
// @desc    Discover new smart locks on the network
// @access  Private
router.get('/discover', protect, discoverSmartLocks);

// @route   GET /api/smart-locks
// @desc    Get all smart locks for the logged in user
// @access  Private
router.get('/', protect, getSmartLocks);

// @route   GET /api/smart-locks/:id
// @desc    Get smart lock by ID
// @access  Private
router.get('/:id', protect, getSmartLockById);

// @route   POST /api/smart-locks
// @desc    Add a new smart lock
// @access  Private
router.post('/', protect, addSmartLock);

// @route   PUT /api/smart-locks/:id
// @desc    Update a smart lock
// @access  Private
router.put('/:id', protect, updateSmartLock);

// @route   DELETE /api/smart-locks/:id
// @desc    Delete a smart lock
// @access  Private
router.delete('/:id', protect, deleteSmartLock);

// @route   POST /api/smart-locks/:id/lock
// @desc    Lock a smart lock
// @access  Private
router.post('/:id/lock', protect, lockSmartLock);

// @route   POST /api/smart-locks/:id/unlock
// @desc    Unlock a smart lock
// @access  Private
router.post('/:id/unlock', protect, unlockSmartLock);

// @route   GET /api/smart-locks/:id/history
// @desc    Get usage history for a smart lock
// @access  Private
router.get('/:id/history', protect, getSmartLockHistory);

module.exports = router;