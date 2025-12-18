// ============================================
// NEXUS AI - PRODUCTION READY SERVER (WITH CORS FIX)
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
// CORS CONFIGURATION - FIXED ✅
// ============================================
const allowedOrigins = [
    // Localhost for development
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'http://127.0.0.1:5501',
    'http://localhost:5501',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    
    // ✅ Production URL - Your actual Render deployment
    'https://nexus-ai-ajw0.onrender.com',
    
    // Environment variable fallback
    process.env.FRONTEND_URL
].filter(Boolean); // Removes undefined values

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, same-origin requests)
        if (!origin) return callback(null, true);
        
        // Allow if origin is in the allowed list
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        // In production, be stricter
        if (isProduction) {
            console.log('❌ CORS blocked origin in production:', origin);
            callback(new Error('Not allowed by CORS'));
        } else {
            // In development, be more permissive
            console.log('⚠️  Allowing origin in development:', origin);
            callback(null, true);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Authorization'],
    maxAge: 86400 // Cache preflight for 24 hours 
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Explicit preflight handling

// ============================================
// MIDDLEWARE
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging (only in development)
if (isDevelopment) {
    app.use((req, res, next) => {
        console.log(`📨 ${req.method} ${req.path}`);
        console.log('📦 Body:', req.body);
        console.log('🔑 Auth:', req.headers.authorization ? 'Present' : 'None');
        next();
    });
}

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
    maxAge: isProduction ? '1d' : 0 // Cache in production
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

        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
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
        cors: 'Enabled ✅',
        allowedOrigins: allowedOrigins
    });
});

// Root health check
app.get('/', (req, res) => {
    res.json({
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
        },
        cors: {
            enabled: true,
            frontend: 'https://nexus-ai-ajw0.onrender.com'
        }
    });
});

// ============================================
// API ROUTES
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/tools', toolRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// ============================================
// SERVE HTML FILES (SPA Support)
// ============================================
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

app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
        return next();
    }
    
    // Serve index.html for root
    if (req.path === '/') {
        return res.sendFile(path.join(__dirname, '../frontend/index.html'));
    }
    
    // Serve known HTML files
    if (htmlFiles.includes(req.path)) {
        return res.sendFile(path.join(__dirname, '../frontend', req.path));
    }
    
    // Fallback to index.html for client-side routing
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ============================================
// 404 ERROR HANDLER
// ============================================
app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
        res.status(404).json({
            success: false,
            message: 'API endpoint not found',
            path: req.path,
            method: req.method
        });
    } else {
        // For non-API routes, serve index.html
        res.sendFile(path.join(__dirname, '../frontend/index.html'));
    }
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

app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔════════════════════════════════════════════════╗
║   🚀 NEXUS AI SERVER STARTED                  ║
╠════════════════════════════════════════════════╣
║  Port:        ${PORT.toString().padEnd(30)} ║
║  Environment: ${(process.env.NODE_ENV || 'development').padEnd(30)} ║
║  MongoDB:     Connected ✅                    ║
║  CORS:        Enabled ✅                      ║
║  Allowed Origins: ${allowedOrigins.length.toString().padEnd(24)} ║
║  Static:      Serving from /frontend ✅       ║
╚════════════════════════════════════════════════╝

📝 Available Endpoints:
   Health:   http://localhost:${PORT}/api/health
   Auth:     http://localhost:${PORT}/api/auth
   Tools:    http://localhost:${PORT}/api/tools
   Reviews:  http://localhost:${PORT}/api/reviews
   Users:    http://localhost:${PORT}/api/users
   Admin:    http://localhost:${PORT}/api/admin

🌐 Frontend URLs Allowed:
${allowedOrigins.map(url => `   • ${url}`).join('\n')}

🌐 Frontend:
   Homepage: http://localhost:${PORT}
   Login:    http://localhost:${PORT}/login.html
   Tools:    http://localhost:${PORT}/tools_listing.html
    `);
});

// ============================================
// GRACEFUL SHUTDOWN - FIXED ✅
// ============================================
process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled Promise Rejection:', error);
    if (isProduction) {
        process.exit(1);
    }
});

process.on('SIGTERM', async () => {
    console.log('👋 SIGTERM received, shutting down gracefully...');
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Error closing MongoDB connection:', error);
        process.exit(1);
    }
});

process.on('SIGINT', async () => {
    console.log('👋 SIGINT received, shutting down gracefully...');
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Error closing MongoDB connection:', error);
        process.exit(1);
    }
});

module.exports = app;