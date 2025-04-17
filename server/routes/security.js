const express = require('express');
const {
  changeSystemState,
  getLogs,
  triggerAlert
} = require('../controllers/securityController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.post('/system', protect, changeSystemState);
router.get('/logs', protect, getLogs);
router.post('/alert', protect, triggerAlert);

module.exports = router;