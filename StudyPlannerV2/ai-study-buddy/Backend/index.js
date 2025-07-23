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
const notesRoutes = require('./routes/notes');
const settingsRoutes = require('./routes/settings');
const todosRoutes = require('./routes/todos');

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads/schedules');
fs.mkdirSync(uploadsDir, { recursive: true });

// CORS configuration
const corsOptions = {
    origin: [
        'http://localhost:3000', 
        'http://localhost:3001', 
        'https://backend-self-theta-51.vercel.app',
        'https://ai-study-buddy-three.vercel.app', // <--- Make sure this is here!
        'https://*.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400 // 24 hours
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Root route
app.get('/', (req, res) => {
    res.json({ 
        message: 'AI Study Buddy API is running!',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            schedules: '/api/schedules',
            studyPlans: '/api/study-plans',
            aiGens: '/api/ai_gens',
            notes: '/api/notes',
            settings: '/api/settings',
            todos: '/api/todos'
        }
    });
});

// Debug logging middleware
app.use((req, res, next) => {
    console.log('=== Incoming Request ===');
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.method === 'POST' ? req.body : 'N/A');
    console.log('=== End Request ===');
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
    dbName: 'site_database',
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4
}).then(() => {
    console.log('✅ MongoDB connected to site_database');
}).catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});

// Add connection error handler
mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
});

// Add disconnection handler
mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

// Add reconnection handler
mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected');
});

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/study-plans', studyPlanRoutes);
app.use('/api/ai_gens', aiGensRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/todos', todosRoutes);
console.log('🛣️ Auth routes registered at /api/auth');
console.log('🛣️ Schedule routes registered at /api/schedules');
console.log('🛣️ Study Plan routes registered at /api/study-plans');
console.log('🛣️ AI Gen routes registered at /api/ai_gens');
console.log('🛣️ Notes routes registered at /api/notes');
console.log('🛣️ Settings routes registered at /api/settings');
console.log('🛣️ Todos routes registered at /api/todos');

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    res.status(500).json({
        message: 'Internal server error',
        error: err.message
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Test the server at http://localhost:${PORT}/api/test`);
});