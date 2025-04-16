const Sensor = require('../models/Sensor');
const SecurityLog = require('../models/SecurityLog');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all sensors for user
// @route   GET /api/sensors
// @access  Private
exports.getSensors = asyncHandler(async (req, res, next) => {
  const sensors = await Sensor.find({ user: req.user.id });

  res.status(200).json({
    success: true,
    count: sensors.length,
    data: sensors
  });
});

// @desc    Get single sensor
// @route   GET /api/sensors/:id
// @access  Private
exports.getSensor = asyncHandler(async (req, res, next) => {
  const sensor = await Sensor.findById(req.params.id);

  if (!sensor) {
    return next(
      new ErrorResponse(`Sensor not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user owns sensor
  if (sensor.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to access this sensor`,
        401
      )
    );
  }

  res.status(200).json({
    success: true,
    data: sensor
  });
});

// @desc    Create new sensor
// @route   POST /api/sensors
// @access  Private
exports.createSensor = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  const sensor = await Sensor.create(req.body);

  // Log the sensor creation
  await SecurityLog.create({
    eventType: 'system',
    description: `New ${req.body.type} sensor added: ${req.body.name}`,
    user: req.user.id,
    sensor: sensor._id
  });

  res.status(201).json({
    success: true,
    data: sensor
  });
});

// @desc    Update sensor
// @route   PUT /api/sensors/:id
// @access  Private
exports.updateSensor = asyncHandler(async (req, res, next) => {
  let sensor = await Sensor.findById(req.params.id);

  if (!sensor) {
    return next(
      new ErrorResponse(`Sensor not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user owns sensor
  if (sensor.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this sensor`,
        401
      )
    );
  }

  sensor = await Sensor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: sensor
  });
});

// @desc    Delete sensor
// @route   DELETE /api/sensors/:id
// @access  Private
exports.deleteSensor = asyncHandler(async (req, res, next) => {
  const sensor = await Sensor.findById(req.params.id);

  if (!sensor) {
    return next(
      new ErrorResponse(`Sensor not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user owns sensor
  if (sensor.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this sensor`,
        401
      )
    );
  }

  await sensor.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});