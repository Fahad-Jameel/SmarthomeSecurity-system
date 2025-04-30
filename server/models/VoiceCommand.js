// models/VoiceCommand.js
const mongoose = require('mongoose');

const VoiceCommandSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
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

module.exports = mongoose.model('voiceCommand', VoiceCommandSchema);