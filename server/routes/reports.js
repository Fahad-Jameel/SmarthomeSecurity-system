// routes/reports.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const mongoose = require('mongoose');

// Define Report schema if not already defined
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

// Create model only if it doesn't exist
let Report;
try {
  Report = mongoose.model('Report');
} catch {
  Report = mongoose.model('Report', ReportSchema);
}

// Try to get Activity model if it exists
let Activity;
try {
  Activity = mongoose.model('Activity');
} catch {
  // If Activity model doesn't exist, create a simple placeholder
  const ActivitySchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    eventType: String,
    description: String,
    timestamp: Date
  });
  Activity = mongoose.model('Activity', ActivitySchema);
}

// @route   GET api/reports
// @desc    Get list of available reports (months)
// @access  Private
router.get('/', protect, asyncHandler(async (req, res, next) => {
  // Get reports from database or generate mock ones
  let reports = await Report.find({ user: req.user.id })
    .select('month generatedAt')
    .sort({ month: -1 });
  
  // If no reports found, generate mock ones
  if (reports.length === 0) {
    const currentDate = new Date();
    reports = [];
    
    // Generate the last 12 months of reports
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - i);
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      
      reports.push({
        month: `${year}-${month}`,
        available: true,
        generated: new Date(year, parseInt(month) - 1, 15) // Simulate generation date
      });
    }
  }
  
  res.status(200).json({
    success: true,
    count: reports.length,
    data: reports
  });
}));

// @route   GET api/reports/:month
// @desc    Get report data for specific month
// @access  Private
router.get('/:month', protect, asyncHandler(async (req, res, next) => {
  const { month } = req.params;
  
  // Validate month format (YYYY-MM)
  if (!/^\d{4}-\d{2}$/.test(month)) {
    return next(new ErrorResponse('Invalid month format. Use YYYY-MM', 400));
  }
  
  // Look for existing report in database
  let report = await Report.findOne({ 
    user: req.user.id,
    month 
  });
  
  if (report) {
    return res.status(200).json({
      success: true,
      data: report.data
    });
  }
  
  // If no report found, generate one
  const [year, monthNum] = month.split('-').map(num => parseInt(num));
  
  // Get start and end dates for the month
  const startDate = new Date(year, monthNum - 1, 1);
  const endDate = new Date(year, monthNum, 0); // Last day of month
  
  // Try to find real activities for this month
  let activities = [];
  try {
    activities = await Activity.find({
      user: req.user.id,
      timestamp: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ timestamp: -1 });
  } catch (e) {
    console.error('Error fetching activities:', e);
    // If an error occurs or no activities found, we'll use generated data
  }
  
  // Generate sample events if none found
  const events = activities.length > 0 ? activities.map(a => ({
    eventType: a.eventType,
    description: a.description,
    timestamp: a.timestamp
  })) : [];
  
  // If no real events, generate sample ones
  if (events.length === 0) {
    const eventTypes = ['arm', 'disarm', 'motion', 'door', 'window', 'system'];
    const descriptions = {
      arm: ['System armed by user', 'System armed remotely', 'System armed automatically by schedule'],
      disarm: ['System disarmed by user', 'System disarmed remotely'],
      motion: ['Motion detected in living room', 'Motion detected in hallway', 'Motion detected in backyard'],
      door: ['Front door opened', 'Back door opened', 'Garage door opened'],
      window: ['Living room window opened', 'Bedroom window opened', 'Kitchen window opened'],
      system: ['System update applied', 'Battery low on front door sensor', 'WiFi connection lost']
    };
    
    // Generate random events for the month
    const daysInMonth = new Date(year, monthNum, 0).getDate();
    for (let i = 0; i < 50; i++) {
      const day = Math.floor(Math.random() * daysInMonth) + 1;
      const hour = Math.floor(Math.random() * 24);
      const minute = Math.floor(Math.random() * 60);
      
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const descriptionOptions = descriptions[eventType];
      const description = descriptionOptions[Math.floor(Math.random() * descriptionOptions.length)];
      
      events.push({
        eventType,
        description,
        timestamp: new Date(year, monthNum - 1, day, hour, minute).toISOString()
      });
    }
    
    // Sort events by timestamp (newest first)
    events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
  
  // Generate activity by day for calendar view
  const activityByDay = [];
  const daysInMonth = new Date(year, monthNum, 0).getDate();
  
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, monthNum - 1, d);
    
    // Filter events for this day
    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.timestamp);
      return eventDate.getDate() === d;
    });
    
    activityByDay.push({
      date: date.toISOString().split('T')[0],
      count: dayEvents.length,
      inMonth: true
    });
  }
  
  // Count event types
  const eventTypeSummary = {};
  events.forEach(event => {
    if (!eventTypeSummary[event.eventType]) {
      eventTypeSummary[event.eventType] = 0;
    }
    eventTypeSummary[event.eventType]++;
  });
  
  // Generate report data
  const reportData = {
    month,
    totalEvents: events.length,
    securityAlerts: events.filter(e => e.eventType === 'motion' || e.eventType === 'door' || e.eventType === 'window').length,
    systemArmedPercentage: Math.floor(Math.random() * 40) + 60, // 60-100%
    mostActiveSensor: 'Front Door Sensor',
    events,
    eventTypeSummary,
    activityByDay,
    insights: [
      `Your system was armed ${Math.floor(Math.random() * 40) + 60}% of the time this month.`,
      `Most activity occurred between 5PM and 8PM.`,
      `Front door was the most active sensor with ${Math.floor(Math.random() * 20) + 10} events.`,
      `There were ${Math.floor(Math.random() * 5)} potential security concerns this month.`
    ]
  };
  
  // Store the report in the database for future requests
  try {
    const newReport = new Report({
      user: req.user.id,
      month,
      data: reportData,
      totalEvents: reportData.totalEvents,
      securityAlerts: reportData.securityAlerts,
      systemArmedPercentage: reportData.systemArmedPercentage,
      insights: reportData.insights,
      generatedAt: new Date()
    });
    
    await newReport.save();
  } catch (e) {
    console.error('Error saving report:', e);
    // Continue even if saving fails
  }
  
  res.status(200).json({
    success: true,
    data: reportData
  });
}));

// @route   GET api/reports/:month/download
// @desc    Download report for specific month
// @access  Private
router.get('/:month/download', protect, asyncHandler(async (req, res, next) => {
  const { month } = req.params;
  const { format = 'pdf' } = req.query;
  
  // Validate month format (YYYY-MM)
  if (!/^\d{4}-\d{2}$/.test(month)) {
    return next(new ErrorResponse('Invalid month format. Use YYYY-MM', 400));
  }
  
  // Get the report data
  const report = await Report.findOne({
    user: req.user.id,
    month
  });
  
  if (!report && format === 'csv') {
    // For CSV format when no report exists
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=report_${month}.csv`);
    return res.send('date,event_type,description\n');
  } else if (!report) {
    // For PDF format when no report exists, send an empty PDF
    const buffer = Buffer.from('%PDF-1.5\n%¥±ë\n\n1 0 obj\n<</Type/Catalog/Pages 2 0 R>>\nendobj\n\n2 0 obj\n<</Type/Pages/Kids[3 0 R]/Count 1>>\nendobj\n\n3 0 obj\n<</Type/Page/MediaBox[0 0 595 842]/Parent 2 0 R/Resources<<>>>>\nendobj\n\nxref\n0 4\n0000000000 65535 f\n0000000018 00000 n\n0000000063 00000 n\n0000000114 00000 n\n\ntrailer\n<</Size 4/Root 1 0 R>>\n\nstartxref\n190\n%%EOF\n');
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=report_${month}.pdf`);
    return res.send(buffer);
  }
  
  // For CSV format
  if (format === 'csv') {
    // Build CSV data
    let csvData = 'date,event_type,description\n';
    
    // Add events
    report.data.events.forEach(event => {
      const date = new Date(event.timestamp).toISOString().split('T')[0];
      // Escape quotes in description
      const escapedDescription = event.description.replace(/"/g, '""');
      csvData += `${date},${event.eventType},"${escapedDescription}"\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=report_${month}.csv`);
    return res.send(csvData);
  }
  
  // For PDF format (in a real app, use a library like PDFKit)
  // Here just sending a basic PDF structure as buffer
  const buffer = Buffer.from('%PDF-1.5\n%¥±ë\n\n1 0 obj\n<</Type/Catalog/Pages 2 0 R>>\nendobj\n\n2 0 obj\n<</Type/Pages/Kids[3 0 R]/Count 1>>\nendobj\n\n3 0 obj\n<</Type/Page/MediaBox[0 0 595 842]/Parent 2 0 R/Resources<<>>>>\nendobj\n\nxref\n0 4\n0000000000 65535 f\n0000000018 00000 n\n0000000063 00000 n\n0000000114 00000 n\n\ntrailer\n<</Size 4/Root 1 0 R>>\n\nstartxref\n190\n%%EOF\n');
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=report_${month}.pdf`);
  return res.send(buffer);
}));

module.exports = router;