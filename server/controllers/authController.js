const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const crypto = require('crypto');

// @desc    Register a user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  try {
    // Get data from either query params or request body
    const email = req.body.email || req.query.email;
    const password = req.body.password || req.query.password;
    const name = req.body.name || req.query.name;
    const phone = req.body.phone || req.query.phone;
    
    // Validate required fields
    if (!name || !email || !password) {
      return next(new ErrorResponse('Please provide name, email and password', 400));
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorResponse('Email already registered', 400));
    }
    
    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone
    });

    // Create session
    req.session.userId = user._id;
    
    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    console.error(`Registration error: ${err.message}`);
    next(err);
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  try {
    // Get email and password from either query params or request body
    const email = req.body.email || req.query.email;
    const password = req.body.password || req.query.password;

    console.log('Login attempt with:', { email, password });

    // Validate email & password
    if (!email || !password) {
      return next(new ErrorResponse('Please provide an email and password', 400));
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Create session
    req.session.userId = user._id;
    
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    console.error(`Login error: ${err.message}`);
    next(err);
  }
});

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  if (req.session) {
    // Destroy the session
    req.session.destroy(err => {
      if (err) {
        return next(new ErrorResponse('Unable to logout', 500));
      }
      
      res.clearCookie('connect.sid');
      res.status(200).json({
        success: true,
        data: {}
      });
    });
  } else {
    res.status(200).json({
      success: true,
      data: {}
    });
  }
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.userId);

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    }
  });
});

exports.hello = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: 'Hello from auth controller'
  });
});