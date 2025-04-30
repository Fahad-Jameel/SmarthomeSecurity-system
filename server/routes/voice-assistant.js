// routes/voice-assistant.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const mongoose = require('mongoose');

// Define VoiceCommand schema if you haven't already
const VoiceCommandSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  command: {
    type: String,
    required: true
  },
  response: {
    type: String
  },
  success: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Create model only if it doesn't exist already
let VoiceCommand;
try {
  VoiceCommand = mongoose.model('VoiceCommand');
} catch {
  VoiceCommand = mongoose.model('VoiceCommand', VoiceCommandSchema);
}

// @route   GET api/voice-assistant/commands
// @desc    Get all available voice commands
// @access  Private
router.get('/commands', protect, asyncHandler(async (req, res, next) => {
  const commands = [
    { command: "arm away", description: "Fully arm the system when nobody is home" },
    { command: "arm home", description: "Arm perimeter sensors only" },
    { command: "disarm", description: "Disarm the security system" },
    { command: "what's the status", description: "Check current system status" },
    { command: "help", description: "List available commands" }
  ];
  
  res.status(200).json({
    success: true,
    data: commands
  });
}));

// @route   POST api/voice-assistant/execute
// @desc    Execute a voice command
// @access  Private
router.post('/execute', protect, asyncHandler(async (req, res, next) => {
  const { command } = req.body;

  // Store command in history
  const newCommand = new VoiceCommand({
    user: req.user.id,
    command,
    timestamp: Date.now()
  });
  
  // Simple processing logic - in a real app, this would be more sophisticated
  const cleanCommand = command.toLowerCase().trim();
  
  let responseMessage = '';
  let success = false;
  let action = '';
  
  if (cleanCommand.includes('arm') && cleanCommand.includes('away')) {
    // Logic to arm system in away mode
    responseMessage = 'System armed in away mode';
    success = true;
    action = 'arm_away';
  } 
  else if (cleanCommand.includes('arm') && cleanCommand.includes('home')) {
    // Logic to arm system in home mode
    responseMessage = 'System armed in home mode';
    success = true;
    action = 'arm_home';
  } 
  else if (cleanCommand.includes('disarm')) {
    // Logic to disarm system
    responseMessage = 'System disarmed';
    success = true;
    action = 'disarm';
  } 
  else if (cleanCommand.includes('status')) {
    // Logic to get system status
    responseMessage = 'System is currently disarmed';
    success = true;
    action = 'status';
  } 
  else if (cleanCommand.includes('help')) {
    // Return list of commands
    responseMessage = 'Available commands: arm away, arm home, disarm, status, help';
    success = true;
    action = 'help';
  } 
  else {
    responseMessage = 'Command not recognized';
    action = 'unknown';
  }
  
  // Update command record with response
  newCommand.response = responseMessage;
  newCommand.success = success;
  await newCommand.save();
  
  res.status(200).json({
    success: true,
    data: { success, action, message: responseMessage }
  });
}));

// @route   GET api/voice-assistant/history
// @desc    Get command history for the user
// @access  Private
router.get('/history', protect, asyncHandler(async (req, res, next) => {
  const history = await VoiceCommand.find({ user: req.user.id })
    .sort({ timestamp: -1 })
    .limit(20);
  
  res.status(200).json({
    success: true,
    count: history.length,
    data: history
  });
}));

module.exports = router;