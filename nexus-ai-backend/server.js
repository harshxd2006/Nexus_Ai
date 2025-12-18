// ============================================
// NEXUS AI - PRODUCTION SERVER - FINAL FIX
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
console.log('📁 Current Directory:', __dirname);
console.log('📁 Frontend Path:', path.join(__dirname, '../frontend'));

// ============================================
// PERMISSIVE CORS - ALLOW EVERYTHING
// ============================================
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

console.log('✅ CORS enabled - permissive mode');

// ============================================
// MIDDLEWARE
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path}`);
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
// IMPORT ROUTES
// ============================================
const authRoutes = require('./routes/auth');
const toolRoutes = require('./routes/tool');
const reviewRoutes = require('./routes/review');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');

// ============================================
// API ROUTES - MUST BE BEFORE STATIC FILES
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/tools', toolRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'NexusAI Backend is running! 🚀',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'Connected ✅' : 'Disconnected ❌',
        cors: 'Enabled ✅',
        paths: {
            __dirname: __dirname,
            frontend: path.join(__dirname, '../frontend')
        }
    });
});

// ============================================
// SERVE FRONTEND STATIC FILES
// ============================================
const frontendPath = path.join(__dirname, '../frontend');
console.log('📂 Serving static files from:', frontendPath);

app.use(express.static(frontendPath, {
    setHeaders: (res, filepath) => {
        if (filepath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        } else if (filepath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        } else if (filepath.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html');
        }
    }
}));

// ============================================
// SERVE HTML FILES - SPA FALLBACK
// ============================================
app.get('*', (req, res) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({
            success: false,
            message: 'API endpoint not found',
            path: req.path
        });
    }
    
    // Serve index.html for all other routes
    const indexPath = path.join(__dirname, '../frontend/index.html');
    console.log('📄 Serving index.html from:', indexPath);
    res.sendFile(indexPath);
});

// ============================================
// GLOBAL ERROR HANDLER
// ============================================
app.use((error, req, res, next) => {
    console.error('❌ Server Error:', error.message);
    console.error('Stack:', error.stack);
    
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
║  Port:        ${PORT}                         ║
║  Environment: ${process.env.NODE_ENV || 'development'} ║
║  MongoDB:     Connected ✅                    ║
║  CORS:        Permissive ✅                   ║
╚════════════════════════════════════════════════╝

📝 API Endpoints Available:
   • GET  /api/health
   • POST /api/auth/register
   • POST /api/auth/login
   • GET  /api/tools
   • And more...

🌐 Server running at: http://localhost:${PORT}
🌐 Production: https://nexus-ai-ajw0.onrender.com
    `);
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================
const gracefulShutdown = async () => {
    console.log('👋 Shutting down gracefully...');
    server.close(async () => {
        try {
            await mongoose.connection.close();
            console.log('✅ MongoDB connection closed');
            process.exit(0);
        } catch (error) {
            console.error('❌ Error during shutdown:', error);
            process.exit(1);
        }
    });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

module.exports = app;