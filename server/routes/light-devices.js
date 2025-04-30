// routes/light-devices.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const mongoose = require('mongoose');

// Define LightDevice schema if not already defined
const LightDeviceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a device name'],
    trim: true
  },
  type: {
    type: String,
    enum: ['lamp', 'ceiling', 'outdoor', 'strip', 'other'],
    default: 'lamp'
  },
  location: {
    type: String,
    required: [true, 'Please add a location']
  },
  status: {
    type: String,
    enum: ['online', 'offline'],
    default: 'online'
  },
  state: {
    type: String,
    enum: ['on', 'off'],
    default: 'off'
  },
  brightness: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  color: {
    type: String,
    default: '#FFFFFF'
  },
  supportsDimming: {
    type: Boolean,
    default: false
  },
  supportsColor: {
    type: Boolean,
    default: false
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Create model only if it doesn't exist
let LightDevice;
try {
  LightDevice = mongoose.model('LightDevice');
} catch {
  LightDevice = mongoose.model('LightDevice', LightDeviceSchema);
}

// @route   GET api/devices/lights
// @desc    Get all light devices for the user
// @access  Private
router.get('/', protect, asyncHandler(async (req, res, next) => {
  const devices = await LightDevice.find({ user: req.user.id });
  
  // For demo purposes, if no devices are found, return sample data
  if (devices.length === 0) {
    const sampleDevices = [
      {
        _id: "60b1e1f7b3f5a82d9c9e1234",
        name: "Living Room Lamp",
        type: "lamp",
        location: "Living Room",
        status: "online",
        state: "off",
        brightness: 100,
        color: "#FFFFFF",
        supportsDimming: true,
        supportsColor: false,
        user: req.user.id
      },
      {
        _id: "60b1e1f7b3f5a82d9c9e1235",
        name: "Kitchen Lights",
        type: "ceiling",
        location: "Kitchen",
        status: "online",
        state: "off",
        brightness: 100,
        color: "#FFFFFF",
        supportsDimming: true,
        supportsColor: false,
        user: req.user.id
      },
      {
        _id: "60b1e1f7b3f5a82d9c9e1236",
        name: "Bedroom Light",
        type: "lamp",
        location: "Bedroom",
        status: "online",
        state: "off",
        brightness: 100,
        color: "#FFFFFF",
        supportsDimming: true,
        supportsColor: true,
        user: req.user.id
      },
      {
        _id: "60b1e1f7b3f5a82d9c9e1237",
        name: "Front Porch Light",
        type: "outdoor",
        location: "Exterior",
        status: "online",
        state: "off",
        brightness: 100,
        color: "#FFFFFF",
        supportsDimming: false,
        supportsColor: false,
        user: req.user.id
      }
    ];
    
    return res.status(200).json({
      success: true,
      count: sampleDevices.length,
      data: sampleDevices
    });
  }
  
  res.status(200).json({
    success: true,
    count: devices.length,
    data: devices
  });
}));

// @route   POST api/devices/lights
// @desc    Add a new light device
// @access  Private
router.post('/', protect, asyncHandler(async (req, res, next) => {
  // Add user to request body
  req.body.user = req.user.id;
  
  const { name, type, location, supportsDimming, supportsColor } = req.body;
  
  // Validate required fields
  if (!name || !location) {
    return next(new ErrorResponse('Please provide name and location', 400));
  }
  
  // Create the new device
  const newDevice = new LightDevice({
    name,
    type: type || 'lamp',
    location,
    status: 'online',
    state: 'off',
    brightness: 100,
    color: '#FFFFFF',
    supportsDimming: supportsDimming !== undefined ? supportsDimming : false,
    supportsColor: supportsColor !== undefined ? supportsColor : false,
    user: req.user.id,
    lastUpdated: Date.now()
  });
  
  const device = await newDevice.save();
  
  res.status(201).json({
    success: true,
    data: device
  });
}));

// @route   GET api/devices/lights/:id
// @desc    Get single light device
// @access  Private
router.get('/:id', protect, asyncHandler(async (req, res, next) => {
  const device = await LightDevice.findById(req.params.id);
  
  if (!device) {
    return next(new ErrorResponse(`Device not found with id of ${req.params.id}`, 404));
  }
  
  // Make sure user owns the device
  if (device.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to access this device`, 401));
  }
  
  res.status(200).json({
    success: true,
    data: device
  });
}));

// @route   PUT api/devices/lights/:id
// @desc    Update light device
// @access  Private
router.put('/:id', protect, asyncHandler(async (req, res, next) => {
  let device = await LightDevice.findById(req.params.id);
  
  if (!device) {
    return next(new ErrorResponse(`Device not found with id of ${req.params.id}`, 404));
  }
  
  // Make sure user owns the device
  if (device.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to update this device`, 401));
  }
  
  // Update lastUpdated timestamp
  req.body.lastUpdated = Date.now();
  
  device = await LightDevice.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: device
  });
}));

// @route   DELETE api/devices/lights/:id
// @desc    Delete light device
// @access  Private
router.delete('/:id', protect, asyncHandler(async (req, res, next) => {
  const device = await LightDevice.findById(req.params.id);
  
  if (!device) {
    return next(new ErrorResponse(`Device not found with id of ${req.params.id}`, 404));
  }
  
  // Make sure user owns the device
  if (device.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to delete this device`, 401));
  }
  
  await device.deleteOne();
  
  res.status(200).json({
    success: true,
    data: {}
  });
}));

// @route   PATCH api/devices/lights/:id/toggle
// @desc    Toggle a light device on or off
// @access  Private
router.patch('/:id/toggle', protect, asyncHandler(async (req, res, next) => {
  let device = await LightDevice.findById(req.params.id);
  
  if (!device) {
    return next(new ErrorResponse(`Device not found with id of ${req.params.id}`, 404));
  }
  
  // Make sure user owns the device
  if (device.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to control this device`, 401));
  }
  
  // Toggle the state
  device.state = device.state === 'on' ? 'off' : 'on';
  device.lastUpdated = Date.now();
  
  await device.save();
  
  res.status(200).json({
    success: true,
    data: device
  });
}));

// @route   PATCH api/devices/lights/:id/brightness
// @desc    Adjust device brightness
// @access  Private
router.patch('/:id/brightness', protect, asyncHandler(async (req, res, next) => {
  const { brightness } = req.body;
  
  if (brightness === undefined || brightness < 0 || brightness > 100) {
    return next(new ErrorResponse('Please provide valid brightness value (0-100)', 400));
  }
  
  let device = await LightDevice.findById(req.params.id);
  
  if (!device) {
    return next(new ErrorResponse(`Device not found with id of ${req.params.id}`, 404));
  }
  
  // Make sure user owns the device
  if (device.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to control this device`, 401));
  }
  
  // Check if device supports dimming
  if (!device.supportsDimming) {
    return next(new ErrorResponse(`This device does not support dimming`, 400));
  }
  
  // Update brightness and lastUpdated
  device.brightness = brightness;
  device.lastUpdated = Date.now();
  
  await device.save();
  
  res.status(200).json({
    success: true,
    data: device
  });
}));

// @route   PATCH api/devices/lights/:id/color
// @desc    Change device color
// @access  Private
router.patch('/:id/color', protect, asyncHandler(async (req, res, next) => {
  const { color } = req.body;
  
  // Validate color format (hex code)
  if (!color || !/^#[0-9A-F]{6}$/i.test(color)) {
    return next(new ErrorResponse('Please provide valid color in hex format (#RRGGBB)', 400));
  }
  
  let device = await LightDevice.findById(req.params.id);
  
  if (!device) {
    return next(new ErrorResponse(`Device not found with id of ${req.params.id}`, 404));
  }
  
  // Make sure user owns the device
  if (device.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to control this device`, 401));
  }
  
  // Check if device supports color
  if (!device.supportsColor) {
    return next(new ErrorResponse(`This device does not support color changes`, 400));
  }
  
  // Update color and lastUpdated
  device.color = color;
  device.lastUpdated = Date.now();
  
  await device.save();
  
  res.status(200).json({
    success: true,
    data: device
  });
}));

module.exports = router;