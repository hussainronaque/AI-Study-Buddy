const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Import routes
const otpRoutes = require('./OTP/otpRoutes');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', otpRoutes);
app.use('/api/auth', authRoutes);

// Connect to MongoDB with enhanced error handling
console.log('Attempting to connect to MongoDB...');
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'URI is set' : 'URI is not set');

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
  console.log('Database name:', mongoose.connection.name);
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  console.error('Error details:', err.message);
  console.error('Error code:', err.code);
  console.error('Error name:', err.name);
});

// Add error handler for MongoDB connection
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error after initial connection:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});