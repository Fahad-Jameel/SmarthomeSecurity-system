// models/Report.js
const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  month: {
    type: String, // Format: "YYYY-MM"
    required: true
  },
  data: {
    type: Object,
    required: true
  },
  totalEvents: {
    type: Number,
    default: 0
  },
  securityAlerts: {
    type: Number,
    default: 0
  },
  systemArmedPercentage: {
    type: Number,
    default: 0
  },
  insights: [{
    type: String
  }],
  generatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Report', ReportSchema);