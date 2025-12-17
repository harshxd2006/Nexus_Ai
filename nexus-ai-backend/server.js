// ============================================
// NEXUS AI - MAIN SERVER FILE
// ============================================

// CRITICAL: Load environment variables FIRST
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// ============================================
// CORS CONFIGURATION - MUST BE FIRST!
// ============================================
const corsOptions = {
    origin: [
        'http://127.0.0.1:5500',
        'http://localhost:5500',
        'http://127.0.0.1:5501',
        'http://localhost:5501',
        'http://localhost:3000',
        'http://127.0.0.1:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Authorization'],
    maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// ============================================
// MIDDLEWARE - MUST BE BEFORE ROUTES!
// ============================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add debug middleware to log all requests
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path}`);
    console.log('📦 Body:', req.body);
    console.log('🔑 Headers:', req.headers.authorization ? 'Token Present' : 'No Token');
    next();
});

// ============================================
// IMPORT ROUTES AFTER MIDDLEWARE
// ============================================
const authRoutes = require('./routes/auth');
const toolRoutes = require('./routes/tool');
const reviewRoutes = require('./routes/review');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');

// ============================================
// MONGODB CONNECTION
// ============================================
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

connectDB();

// ============================================
// HEALTH CHECK ROUTE
// ============================================
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Backend is running! 🚀',
        timestamp: new Date(),
        cors: 'enabled'
    });
});

// ============================================
// ROUTE MOUNTING
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/tools', toolRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// ============================================
// 404 ERROR HANDLER
// ============================================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: '❌ Route not found',
        path: req.path
    });
});

// ============================================
// GLOBAL ERROR HANDLER
// ============================================
app.use((error, req, res, next) => {
    console.error('❌ Error:', error.message);
    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║   🚀 NEXUS AI BACKEND STARTED 🚀     ║
╠════════════════════════════════════════╣
║  Server: http://localhost:${PORT}       ║
║  Health: http://localhost:${PORT}/api/health   ║
║  MongoDB: Connected ✅                ║
║  CORS: Enabled ✅                     ║
╚════════════════════════════════════════╝
    `);
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================
process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled Rejection:', error);
    process.exit(1);
});

process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received, shutting down gracefully...');
    mongoose.connection.close(() => {
        console.log('MongoDB connection closed');
        process.exit(0);
    });
});

module.exports = app;