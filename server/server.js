const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const morgan = require('morgan');
const path = require('path');
const { errorHandler } = require('./middleware/errorHandler');

// Load environment variables
require('dotenv').config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

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

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));