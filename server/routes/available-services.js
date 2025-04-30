// routes/available-services.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const asyncHandler = require('../middleware/async');

// @route   GET api/integrations/available-alarm-services
// @desc    Get all available alarm services for integration
// @access  Private
router.get('/', protect, asyncHandler(async (req, res, next) => {
  const services = [
    {
      id: 'adt',
      name: 'ADT Security',
      logo: '/assets/logos/adt.png',
      description: 'Professional monitoring with 24/7 support and fast emergency response.',
      features: [
        '24/7 Professional Monitoring', 
        'Emergency Dispatch', 
        'SMS & Email Alerts',
        'Mobile App Integration'
      ]
    },
    {
      id: 'simplisafe',
      name: 'SimpliSafe',
      logo: '/assets/logos/simplisafe.png',
      description: 'DIY security with professional monitoring and no long-term contracts.',
      features: [
        'No Long-Term Contracts', 
        'Professional Monitoring', 
        'Cellular Backup',
        'Environmental Protection'
      ]
    },
    {
      id: 'vivint',
      name: 'Vivint Smart Home',
      logo: '/assets/logos/vivint.png',
      description: 'Complete smart home security with professional installation and monitoring.',
      features: [
        'Smart Home Integration', 
        'Advanced Security Features', 
        'Professional Installation',
        'Video Monitoring'
      ]
    }
  ];
  
  res.status(200).json({
    success: true,
    count: services.length,
    data: services
  });
}));

module.exports = router;