const mongoose = require('mongoose');

// Cache the connection to avoid creating multiple connections in serverless environment
let cachedConnection = null;

const connectDB = async () => {
  // If we already have a connection, return it
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smarthomesecurity', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Serverless optimization
      bufferCommands: false,
      bufferMaxEntries: 0,
      // Connection pooling for serverless
      maxPoolSize: 1,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Cache the connection
    cachedConnection = conn;
    
    // Handle connection events
    conn.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      cachedConnection = null;
    });

    conn.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      cachedConnection = null;
    });

    return conn;
  } catch (err) {
    console.error(`Error connecting to MongoDB: ${err.message}`);
    // Don't exit process in serverless environment, just throw the error
    throw err;
  }
};

module.exports = connectDB;