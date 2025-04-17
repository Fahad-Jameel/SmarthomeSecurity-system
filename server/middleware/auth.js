const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  // Check if user is logged in via session
  if (!req.session || !req.session.userId) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Find the user in the database
    const user = await User.findById(req.session.userId);
    
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Make user data available on the request object
    req.userId = user._id;
    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
});