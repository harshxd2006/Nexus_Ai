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
// SERVE FRONTEND STATIC FILES WITH CORRECT MIME TYPES
// ============================================
app.use(express.static(path.join(__dirname, '../frontend'), {
    setHeaders: (res, filepath) => {
        // CRITICAL: Set correct MIME types to fix "Refused to execute script" errors
        if (filepath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        } else if (filepath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        } else if (filepath.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html');
        } else if (filepath.endsWith('.json')) {
            res.setHeader('Content-Type', 'application/json');
        }
    }
}));

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
        cors: 'enabled',
        frontend: 'Static files served with correct MIME types ✅'
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
// SERVE HTML FILES (Fallback for SPA-style routing)
// ============================================
app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
        return next();
    }
    
    // List of HTML files
    const htmlFiles = [
        '/index.html',
        '/login.html',
        '/register.html',
        '/signup.html',
        '/tools_listing.html',
        '/tools_detail.html',
        '/tool_detail.html',
        '/profile.html',
        '/admin_dashboard.html',
        '/compare.html',
        '/trending.html'
    ];
    
    // If requesting root, serve index.html
    if (req.path === '/') {
        return res.sendFile(path.join(__dirname, '../frontend/index.html'));
    }
    
    // If requesting a known HTML file, serve it
    if (htmlFiles.includes(req.path)) {
        return res.sendFile(path.join(__dirname, '../frontend', req.path));
    }
    
    // Otherwise continue to 404 handler
    next();
});

// ============================================
// 404 ERROR HANDLER
// ============================================
app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
        res.status(404).json({
            success: false,
            message: '❌ Route not found',
            path: req.path
        });
    } else {
        res.status(404).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>404 - Not Found</title>
                <style>
                    body { 
                        font-family: 'Segoe UI', Arial, sans-serif; 
                        display: flex; 
                        justify-content: center; 
                        align-items: center; 
                        height: 100vh; 
                        margin: 0;
                        background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
                        color: #e0e0e0;
                    }
                    .container { text-align: center; }
                    h1 { font-size: 4rem; color: #64c8ff; margin: 0; }
                    p { font-size: 1.2rem; margin: 1rem 0; }
                    a { 
                        color: #64c8ff; 
                        text-decoration: none; 
                        padding: 0.8rem 1.5rem;
                        border: 2px solid #64c8ff;
                        border-radius: 8px;
                        display: inline-block;
                        margin-top: 1rem;
                        transition: all 0.3s ease;
                    }
                    a:hover { 
                        background: #64c8ff;
                        color: #1a1a1a;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>404</h1>
                    <p>Page not found</p>
                    <a href="/">← Back to Home</a>
                </div>
            </body>
            </html>
        `);
    }
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
╔════════════════════════════════════════════════╗
║   🚀 NEXUS AI FULL-STACK SERVER STARTED 🚀   ║
╠════════════════════════════════════════════════╣
║  Frontend: http://localhost:${PORT}              ║
║  Backend:  http://localhost:${PORT}/api          ║
║  Health:   http://localhost:${PORT}/api/health   ║
║  MongoDB:  Connected ✅                       ║
║  CORS:     Enabled ✅                         ║
║  Static:   Serving from /frontend ✅          ║
║  MIME:     JavaScript files fixed ✅          ║
╚════════════════════════════════════════════════╝

📝 Access your app:
   Homepage: http://localhost:${PORT}
   Login:    http://localhost:${PORT}/login.html
   Tools:    http://localhost:${PORT}/tools_listing.html
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