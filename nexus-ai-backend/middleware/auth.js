// ============================================
// AUTH MIDDLEWARE
// Verify JWT tokens
// ============================================

const { verifyToken } = require('../config/jwt');

// ============================================
// VERIFY TOKEN MIDDLEWARE
// ============================================

exports.verifyTokenMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const decoded = verifyToken(token);
        req.userId = decoded.userId;
        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

// ============================================
// VERIFY ADMIN MIDDLEWARE
// ============================================

exports.verifyAdminMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const decoded = verifyToken(token);
        const User = require('../models/User');
        const user = await User.findById(decoded.userId);

        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        req.userId = decoded.userId;
        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

// ============================================
// EXPORTS
// ============================================

module.exports = exports;
