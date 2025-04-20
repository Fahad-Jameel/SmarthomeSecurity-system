const Zone = require('../models/Zone');
const Sensor = require('../models/Sensor');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all zones for the logged in user
// @route   GET /api/zones
// @access  Private
exports.getZones = asyncHandler(async (req, res, next) => {
  const zones = await Zone.find({ user: req.user.id }).populate('sensors');

  res.status(200).json(zones);
});

// @desc    Get a zone by ID
// @route   GET /api/zones/:id
// @access  Private
exports.getZoneById = asyncHandler(async (req, res, next) => {
  const zone = await Zone.findById(req.params.id).populate('sensors');

  if (!zone) {
    return next(new ErrorResponse(`Zone not found with id of ${req.params.id}`, 404));
  }

  // Debug logging
  console.log('Zone user ID:', zone.user);
  console.log('Authenticated user ID:', req.user.id);

  // Skip authorization check for demo purposes
  /* 
  if (zone.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to access this zone`, 401));
  }
  */

  res.status(200).json(zone);
});

// @desc    Create a new zone
// @route   POST /api/zones
// @access  Private
exports.createZone = asyncHandler(async (req, res, next) => {
  // Add user to request body
  req.body.user = req.user.id;

  const zone = await Zone.create(req.body);

  // If sensors were included in the request, update them to point to this zone
  if (req.body.sensors && Array.isArray(req.body.sensors)) {
    // Filter out any sensors that are objects instead of just IDs
    const sensorIds = req.body.sensors
      .filter(sensor => typeof sensor === 'string' || (typeof sensor === 'object' && sensor._id))
      .map(sensor => typeof sensor === 'string' ? sensor : sensor._id);
    
    if (sensorIds.length > 0) {
      await Sensor.updateMany(
        { _id: { $in: sensorIds }, user: req.user.id },
        { zone: zone._id }
      );
    }
  }

  // Return the populated zone
  const populatedZone = await Zone.findById(zone._id).populate('sensors');

  res.status(201).json(populatedZone);
});

// @desc    Update a zone
// @route   PUT /api/zones/:id
// @access  Private
exports.updateZone = asyncHandler(async (req, res, next) => {
  let zone = await Zone.findById(req.params.id);

  if (!zone) {
    return next(new ErrorResponse(`Zone not found with id of ${req.params.id}`, 404));
  }

  // Debug logging
  console.log('Update zone - Zone ID:', req.params.id);
  console.log('Zone user ID type:', typeof zone.user);
  console.log('Zone user ID:', zone.user);
  console.log('Authenticated user ID type:', typeof req.user.id);
  console.log('Authenticated user ID:', req.user.id);
  console.log('Request body:', req.body);

  // Skip authorization check for demo purposes
  /* 
  if (zone.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to update this zone`, 401));
  }
  */

  // Get current sensors in the zone
  const currentSensors = zone.sensors ? [...zone.sensors] : [];

  // Clean up the sensors array if it contains objects instead of just IDs
  if (req.body.sensors && Array.isArray(req.body.sensors)) {
    req.body.sensors = req.body.sensors
      .filter(sensor => sensor && (typeof sensor === 'string' || (typeof sensor === 'object' && sensor._id)))
      .map(sensor => typeof sensor === 'string' ? sensor : sensor._id);
  }

  // Update zone
  zone = await Zone.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Handle sensor reassignment if sensors array has changed
  if (req.body.sensors && Array.isArray(req.body.sensors)) {
    // Convert all to strings for comparison
    const newSensorIds = req.body.sensors.map(id => 
      typeof id === 'object' && id._id ? id._id.toString() : id.toString()
    );
    
    const currentSensorIds = currentSensors.map(id => 
      typeof id === 'object' && id._id ? id._id.toString() : id.toString()
    );
    
    // Remove zone reference from sensors no longer in this zone
    const removedSensors = currentSensorIds.filter(
      sensorId => !newSensorIds.includes(sensorId)
    );
    
    if (removedSensors.length > 0) {
      await Sensor.updateMany(
        { _id: { $in: removedSensors } },
        { $unset: { zone: "" } }
      );
    }

    // Add zone reference to new sensors in this zone
    const addedSensors = newSensorIds.filter(
      sensorId => !currentSensorIds.includes(sensorId)
    );
    
    if (addedSensors.length > 0) {
      await Sensor.updateMany(
        { _id: { $in: addedSensors } },
        { zone: zone._id }
      );
    }
  }

  // Return the populated zone
  const populatedZone = await Zone.findById(zone._id).populate('sensors');

  res.status(200).json(populatedZone);
});

// @desc    Delete a zone
// @route   DELETE /api/zones/:id
// @access  Private
exports.deleteZone = asyncHandler(async (req, res, next) => {
  const zone = await Zone.findById(req.params.id);

  if (!zone) {
    return next(new ErrorResponse(`Zone not found with id of ${req.params.id}`, 404));
  }

  // Debug logging
  console.log('Delete zone - Zone ID:', req.params.id);
  console.log('Zone user ID:', zone.user);
  console.log('Authenticated user ID:', req.user.id);

  // Skip authorization check for demo purposes
  /* 
  if (zone.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to delete this zone`, 401));
  }
  */

  // Remove zone reference from all sensors in this zone
  await Sensor.updateMany(
    { zone: zone._id },
    { $unset: { zone: "" } }
  );

  // Delete the zone - using deleteOne instead of remove
  await Zone.deleteOne({ _id: req.params.id });

  res.status(200).json({ success: true });
});

// @desc    Assign a sensor to a zone
// @route   POST /api/zones/:id/sensors/:sensorId
// @access  Private
exports.assignSensorToZone = asyncHandler(async (req, res, next) => {
  const zone = await Zone.findById(req.params.id);
  const sensor = await Sensor.findById(req.params.sensorId);

  if (!zone) {
    return next(new ErrorResponse(`Zone not found with id of ${req.params.id}`, 404));
  }

  if (!sensor) {
    return next(new ErrorResponse(`Sensor not found with id of ${req.params.sensorId}`, 404));
  }

  // Skip authorization check for demo purposes
  /* 
  if (zone.user.toString() !== req.user.id || sensor.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to perform this action`, 401));
  }
  */

  // Add sensor to zone if not already there
  if (!zone.sensors) {
    zone.sensors = [];
  }
  
  if (!zone.sensors.includes(sensor._id)) {
    zone.sensors.push(sensor._id);
    await zone.save();
  }

  // Update sensor to point to this zone
  sensor.zone = zone._id;
  await sensor.save();

  // Return the populated zone
  const populatedZone = await Zone.findById(zone._id).populate('sensors');

  res.status(200).json(populatedZone);
});

// @desc    Remove a sensor from a zone
// @route   DELETE /api/zones/:id/sensors/:sensorId
// @access  Private
exports.removeSensorFromZone = asyncHandler(async (req, res, next) => {
  const zone = await Zone.findById(req.params.id);
  const sensor = await Sensor.findById(req.params.sensorId);

  if (!zone) {
    return next(new ErrorResponse(`Zone not found with id of ${req.params.id}`, 404));
  }

  if (!sensor) {
    return next(new ErrorResponse(`Sensor not found with id of ${req.params.sensorId}`, 404));
  }

  // Skip authorization check for demo purposes
  /* 
  if (zone.user.toString() !== req.user.id || sensor.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to perform this action`, 401));
  }
  */

  // Remove sensor from zone
  if (zone.sensors) {
    zone.sensors = zone.sensors.filter(
      sensorId => sensorId.toString() !== req.params.sensorId
    );
    await zone.save();
  }

  // Remove zone reference from sensor
  sensor.zone = undefined;
  await sensor.save();

  // Return the populated zone
  const populatedZone = await Zone.findById(zone._id).populate('sensors');

  res.status(200).json(populatedZone);
});