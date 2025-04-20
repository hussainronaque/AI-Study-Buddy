const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const scheduleRoutes = require('./routes/schedules');
const studyPlanRoutes = require('./routes/studyPlans');
const aiGensRoutes = require('./routes/aiGens');

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads/schedules');
fs.mkdirSync(uploadsDir, { recursive: true });

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Debug logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.method === 'POST' ? req.body : 'N/A');
  next();
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Connect to MongoDB site_database
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'site_database'
}).then(() => {
    console.log('✅ MongoDB connected to site_database');
}).catch(err => {
    console.error('❌ MongoDB connection error:', err);
});

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/study-plans', studyPlanRoutes);
app.use('/api/ai_gens', aiGensRoutes);
console.log('🛣️ Auth routes registered at /api/auth');
console.log('🛣️ Schedule routes registered at /api/schedules');
console.log('🛣️ Study Plan routes registered at /api/study-plans');
console.log('🛣️ AI Gen routes registered at /api/ai_gens');

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    res.status(500).json({
        message: 'Internal server error',
        error: err.message
    });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Test the server at http://localhost:${PORT}/api/test`);
});