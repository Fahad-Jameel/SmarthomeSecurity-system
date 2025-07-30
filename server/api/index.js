const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDB = require('../config/db');
const errorHandler = require('../middleware/errorHandler');

// Load environment variables
require('dotenv').config();

const app = express();

// Connect to database (but don't block the app startup)
connectDB().then(() => {
  console.log('Database connected successfully');
}).catch(err => {
  console.error('Failed to connect to database:', err);
  // Don't exit in serverless environment, the app can still start
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(morgan('dev'));

// Set up session store
app.use(session({
  secret: process.env.SESSION_SECRET || 'session_secret_dev_only',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI || 'mongodb://localhost:27017/smarthomesecurity',
    collectionName: 'sessions',
    // Serverless optimization
    touchAfter: 24 * 3600, // Only update session once per day
    mongoOptions: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 1,
    }
  }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
  }
}));

// Routes
app.use('/api/auth', require('../routes/auth'));
app.use('/api/users', require('../routes/users'));
app.use('/api/sensors', require('../routes/sensors'));
app.use('/api/security', require('../routes/security'));
app.use('/api/cameras', require('../routes/cameras'));
app.use('/api/activities', require('../routes/activities'));
app.use('/api/zones', require('../routes/zones'));
app.use('/api/access-codes', require('../routes/access-codes'));
app.use('/api/smart-locks', require('../routes/smart-locks'));
app.use('/api/notifications', require('../routes/notifications'));

// Sprint 3 routes
app.use('/api/voice-assistant', require('../routes/voice-assistant'));
app.use('/api/users/language', require('../routes/language'));
app.use('/api/schedules/lights', require('../routes/light-schedules'));
app.use('/api/devices/lights', require('../routes/light-devices'));
app.use('/api/integrations/alarm-services', require('../routes/alarm-services'));
app.use('/api/integrations/available-alarm-services', require('../routes/available-services'));
app.use('/api/reports', require('../routes/reports'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use(errorHandler);

// Export for Vercel
module.exports = app; 