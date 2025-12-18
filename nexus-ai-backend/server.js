// ============================================
// NEXUS AI - PRODUCTION READY SERVER
// ============================================

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// ============================================
// ENVIRONMENT DETECTION
// ============================================
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = !isProduction;

console.log('🌍 Environment:', isProduction ? 'PRODUCTION' : 'DEVELOPMENT');

// ============================================
// CORS CONFIGURATION - PERMISSIVE ✅
// ============================================
app.use(cors({
    origin: true, // Allow all origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Authorization']
}));

app.options('*', cors());

console.log('✅ CORS enabled with permissive settings');

// ============================================
// MIDDLEWARE
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('📦 Body:', req.body);
    }
    next();
});

// ============================================
// SERVE FRONTEND STATIC FILES
// ============================================
app.use(express.static(path.join(__dirname, '../frontend'), {
    setHeaders: (res, filepath) => {
        if (filepath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        } else if (filepath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        } else if (filepath.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html');
        } else if (filepath.endsWith('.json')) {
            res.setHeader('Content-Type', 'application/json');
        }
    },
    maxAge: isProduction ? '1d' : 0
}));

// ============================================
// IMPORT ROUTES
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
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        
        console.log('✅ MongoDB connected successfully');
        console.log('📊 Database:', mongoose.connection.name);
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
        message: 'NexusAI Backend is running! 🚀',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'Connected ✅' : 'Disconnected ❌',
        cors: 'Enabled ✅'
    });
});

// Root health check
app.get('/', (req, res, next) => {
    // If requesting API info, return JSON
    if (req.accepts('json') && !req.accepts('html')) {
        return res.json({
            success: true,
            message: 'NexusAI API Server',
            version: '1.0.0',
            endpoints: {
                health: '/api/health',
                auth: '/api/auth',
                tools: '/api/tools',
                reviews: '/api/reviews',
                users: '/api/users',
                admin: '/api/admin'
            }
        });
    }
    // Otherwise serve the frontend
    next();
});

// ============================================
// API ROUTES (BEFORE STATIC FILE HANDLER)
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/tools', toolRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// ============================================
// SERVE HTML FILES (SPA Support)
// ============================================
app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
        return next();
    }
    
    // Serve index.html for all non-API routes
    res.sendFile(path.join(__dirname, '../frontend/index.html'), (err) => {
        if (err) {
            console.error('Error serving index.html:', err);
            res.status(500).send('Error loading page');
        }
    });
});

// ============================================
// 404 ERROR HANDLER
// ============================================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found',
        path: req.path,
        method: req.method
    });
});

// ============================================
// GLOBAL ERROR HANDLER
// ============================================
app.use((error, req, res, next) => {
    console.error('❌ Server Error:', error.message);
    
    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Internal Server Error',
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
║   🚀 NEXUS AI SERVER STARTED                  ║
╠════════════════════════════════════════════════╣
║  Port:        ${PORT.toString().padEnd(30)} ║
║  Environment: ${(process.env.NODE_ENV || 'development').padEnd(30)} ║
║  MongoDB:     Connected ✅                    ║
║  CORS:        Permissive Mode ✅              ║
║  Static:      Serving from /frontend ✅       ║
╚════════════════════════════════════════════════╝

📝 API Endpoints:
   Health:   http://localhost:${PORT}/api/health
   Auth:     http://localhost:${PORT}/api/auth
   Tools:    http://localhost:${PORT}/api/tools
   Reviews:  http://localhost:${PORT}/api/reviews
   Users:    http://localhost:${PORT}/api/users
   Admin:    http://localhost:${PORT}/api/admin

🌐 Frontend: http://localhost:${PORT}
    `);
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================
process.on('SIGTERM', async () => {
    console.log('👋 SIGTERM received, shutting down gracefully...');
    server.close(async () => {
        try {
            await mongoose.connection.close();
            console.log('MongoDB connection closed');
            process.exit(0);
        } catch (error) {
            console.error('Error closing MongoDB connection:', error);
            process.exit(1);
        }
    });
});

process.on('SIGINT', async () => {
    console.log('👋 SIGINT received, shutting down gracefully...');
    server.close(async () => {
        try {
            await mongoose.connection.close();
            console.log('MongoDB connection closed');
            process.exit(0);
        } catch (error) {
            console.error('Error closing MongoDB connection:', error);
            process.exit(1);
        }
    });
});

module.exports = app;