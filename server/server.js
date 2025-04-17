const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
require('dotenv').config();

// Connect to database
connectDB().then(() => {
  console.log('Database connected successfully');
}).catch(err => {
  console.error('Failed to connect to database:', err);
  process.exit(1);
});

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsers - add urlencoded parser before json parser
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
    collectionName: 'sessions'
  }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
  }
}));

// Debug middleware to log request details
app.use((req, res, next) => {
  console.log('-------------------------------');
  console.log('Request URL:', req.url);
  console.log('Request Method:', req.method);
  console.log('Request Query:', req.query);
  console.log('Request Body:', req.body);
  console.log('-------------------------------');
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/sensors', require('./routes/sensors'));
app.use('/api/security', require('./routes/security'));
app.use('/api/notifications', require('./routes/notifications'));

// Error handling middleware
app.use(errorHandler);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});