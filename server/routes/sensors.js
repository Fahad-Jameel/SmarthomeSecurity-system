const express = require('express');
const {
  getSensors,
  getSensor,
  createSensor,
  updateSensor,
  deleteSensor
} = require('../controllers/sensorController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getSensors)
  .post(protect, createSensor);

router.route('/:id')
  .get(protect, getSensor)
  .put(protect, updateSensor)
  .delete(protect, deleteSensor);

module.exports = router;