// routes/language.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// @route   GET api/users/language
// @desc    Get user's language preference
// @access  Private
router.get('/', protect, asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }
  
  res.status(200).json({
    success: true,
    data: { language: user.language || 'en' }
  });
}));

// @route   PATCH api/users/language
// @desc    Update user's language preference
// @access  Private
router.patch('/', protect, asyncHandler(async (req, res, next) => {
  const { language } = req.body;
  
  // Validate language code (basic validation)
  const validLanguages = ['en', 'es', 'fr', 'de', 'ar', 'zh', 'hi', 'ja'];
  if (!validLanguages.includes(language)) {
    return next(new ErrorResponse('Invalid language code', 400));
  }
  
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }
  
  // Update language preference
  user.language = language;
  await user.save();
  
  res.status(200).json({
    success: true,
    data: { language: user.language }
  });
}));

module.exports = router;