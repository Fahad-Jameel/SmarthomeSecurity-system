const express = require('express');
const {
  register,
  login,
  logout,
  getMe,
  hello
} = require('../controllers/authController');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.get('/hello', hello);  // Add semicolon for consistency

module.exports = router;