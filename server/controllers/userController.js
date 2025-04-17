const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone
  };

  // Handle password change if included
  if (req.body.currentPassword && req.body.newPassword) {
    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(req.body.currentPassword);
    
    if (!isMatch) {
      return next(new ErrorResponse('Current password is incorrect', 401));
    }

    // User exists and password matches, update password
    user.password = req.body.newPassword;
    await user.save();

    // Filter out password-related fields from main update
    delete fieldsToUpdate.currentPassword;
    delete fieldsToUpdate.newPassword;
  }

  // Update user profile
  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});