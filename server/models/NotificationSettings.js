const mongoose = require('mongoose');

const NotificationSettingsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  pushEnabled: {
    type: Boolean,
    default: true
  },
  emailEnabled: {
    type: Boolean,
    default: true
  },
  smsEnabled: {
    type: Boolean,
    default: false
  },
  emailAddress: {
    type: String,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  notifyOnArm: {
    type: Boolean,
    default: true
  },
  notifyOnDisarm: {
    type: Boolean,
    default: true
  },
  notifyOnMotion: {
    type: Boolean,
    default: true
  },
  notifyOnDoor: {
    type: Boolean,
    default: true
  },
  notifyOnWindow: {
    type: Boolean,
    default: true
  },
  notifyOnBattery: {
    type: Boolean,
    default: true
  },
  notifyOnOffline: {
    type: Boolean,
    default: true
  },
  quietHoursEnabled: {
    type: Boolean,
    default: false
  },
  quietHoursStart: {
    type: String,
    default: '22:00',
    validate: {
      validator: function(v) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: props => `${props.value} is not a valid time format (HH:MM)!`
    }
  },
  quietHoursEnd: {
    type: String,
    default: '07:00',
    validate: {
      validator: function(v) {
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: props => `${props.value} is not a valid time format (HH:MM)!`
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
NotificationSettingsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('NotificationSettings', NotificationSettingsSchema);