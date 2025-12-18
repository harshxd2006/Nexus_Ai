// ============================================
// NEXUS AI - BACKEND API ONLY
// ============================================

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// ============================================
// ENVIRONMENT DETECTION
// ============================================
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = !isProduction;

console.log('🌍 Environment:', isProduction ? 'PRODUCTION' : 'DEVELOPMENT');

// ============================================
// CORS CONFIGURATION
// ============================================
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        // Allow all origins (frontend will be on Vercel)
        callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
    exposedHeaders: ['Content-Length', 'Content-Type'],
    maxAge: 86400, // 24 hours
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Additional CORS headers as backup
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

console.log('✅ CORS enabled - allowing all origins');

// ============================================
// MIDDLEWARE
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path} - Origin: ${req.get('origin') || 'none'}`);
    next();
});

// ============================================
// MONGODB CONNECTION
// ============================================
const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        
        console.log('✅ MongoDB connected successfully');
        console.log('📊 Database:', mongoose.connection.name);
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        if (isDevelopment) {
            process.exit(1);
        }
    }
};

connectDB();

// Handle MongoDB connection events
mongoose.connection.on('error', err => {
    console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected');
});

// ============================================
// IMPORT ROUTES
// ============================================
const authRoutes = require('./routes/auth');
const toolRoutes = require('./routes/tool');
const reviewRoutes = require('./routes/review');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');

// ============================================
// API ROUTES
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/tools', toolRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'NexusAI Backend API is running! 🚀',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'Connected ✅' : 'Disconnected ❌',
        cors: 'Enabled ✅',
        uptime: process.uptime()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'NexusAI API',
        version: '1.0.0',
        message: 'Backend API is running',
        documentation: 'https://nexus-ai-ajw0.onrender.com/api/health',
        endpoints: {
            health: '/api/health',
            tools: '/api/tools',
            auth: '/api/auth/login',
            register: '/api/auth/register'
        }
    });
});

// 404 handler for undefined API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found',
        path: req.path,
        availableEndpoints: [
            'GET /api/health',
            'POST /api/auth/register',
            'POST /api/auth/login',
            'GET /api/tools',
            'GET /api/tools/:id',
            'POST /api/reviews',
            'GET /api/users/me/profile'
        ]
    });
});

// Catch all other routes (non-API)
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'This is an API server. Please use /api/* endpoints.',
        hint: 'Try /api/health to check server status'
    });
});

// ============================================
// GLOBAL ERROR HANDLER
// ============================================
app.use((error, req, res, next) => {
    console.error('❌ Server Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('Request:', req.method, req.path);
    
    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Internal Server Error',
        path: req.path,
        ...(isDevelopment && { stack: error.stack })
    });
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔════════════════════════════════════════════════╗
║   🚀 NEXUS AI BACKEND API                     ║
╠════════════════════════════════════════════════╣
║  Port:        ${PORT}                         ║
║  Environment: ${process.env.NODE_ENV || 'development'} ║
║  MongoDB:     ${mongoose.connection.readyState === 1 ? 'Connected ✅' : 'Connecting...'}     ║
║  CORS:        All Origins ✅                  ║
╚════════════════════════════════════════════════╝

📝 API Endpoints:
   • GET  /api/health
   • POST /api/auth/register
   • POST /api/auth/login
   • GET  /api/tools
   • GET  /api/tools/:id
   • POST /api/reviews
   • GET  /api/users/me/profile

🌐 Backend API URL: https://nexus-ai-ajw0.onrender.com
🎯 Frontend will be deployed separately on Vercel

✅ Ready to accept API requests!
    `);
});

// Handle server errors
server.on('error', (error) => {
    console.error('❌ Server error:', error);
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
        process.exit(1);
    }
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================
const gracefulShutdown = async (signal) => {
    console.log(`\n👋 Received ${signal}. Shutting down gracefully...`);
    
    server.close(async () => {
        console.log('🔒 HTTP server closed');
        try {
            await mongoose.connection.close();
            console.log('✅ MongoDB connection closed');
            process.exit(0);
        } catch (error) {
            console.error('❌ Error during shutdown:', error);
            process.exit(1);
        }
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
        console.error('⚠️  Forced shutdown after timeout');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = app;