// ============================================
// JWT CONFIGURATION
// Token Creation & Verification
// ============================================

const jwt = require('jsonwebtoken');

// Get JWT secret from environment variable
const JWT_SECRET = process.env.JWT_SECRET;

// Token expiration times
const TOKEN_EXPIRY = {
    ACCESS_TOKEN: '7d',      // 7 days
    REFRESH_TOKEN: '30d'     // 30 days
};

// ============================================
// CREATE JWT TOKEN
// ============================================

/**
 * Create a new JWT token
 * @param {string} userId - User's unique ID
 * @param {object} additionalData - Extra data to include in token
 * @returns {string} JWT token
 */
const createToken = (userId, additionalData = {}) => {
    try {
        if (!JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined in .env file');
        }

        // Token payload (data inside the token)
        const payload = {
            userId,
            ...additionalData,
            iat: Math.floor(Date.now() / 1000)  // Issued at time
        };

        // Create token
        const token = jwt.sign(payload, JWT_SECRET, {
            expiresIn: TOKEN_EXPIRY.ACCESS_TOKEN,
            algorithm: 'HS256'  // HMAC SHA-256 algorithm
        });

        return token;

    } catch (error) {
        console.error('❌ Error creating JWT token:', error.message);
        throw error;
    }
};

// ============================================
// GENERATE TOKEN (Alias for createToken)
// ============================================

/**
 * Generate JWT token - Alias for createToken
 * @param {string} userId - User's unique ID
 * @returns {string} JWT token
 */
const generateToken = (userId) => {
    return createToken(userId);
};

// ============================================
// VERIFY JWT TOKEN
// ============================================

/**
 * Verify a JWT token
 * @param {string} token - Token to verify
 * @returns {object} Decoded token payload
 */
const verifyToken = (token) => {
    try {
        if (!JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined in .env file');
        }

        if (!token) {
            throw new Error('Token is required');
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET, {
            algorithms: ['HS256']
        });

        return decoded;

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token has expired');
        } else if (error.name === 'JsonWebTokenError') {
            throw new Error('Invalid token');
        } else {
            throw new Error('Token verification failed: ' + error.message);
        }
    }
};

// ============================================
// DECODE JWT TOKEN (Without verification)
// ============================================

/**
 * Decode a JWT token without verification
 * Use this only to read the payload (don't trust the data)
 * @param {string} token - Token to decode
 * @returns {object} Decoded token payload
 */
const decodeToken = (token) => {
    try {
        if (!token) {
            throw new Error('Token is required');
        }

        const decoded = jwt.decode(token);

        if (!decoded) {
            throw new Error('Could not decode token');
        }

        return decoded;

    } catch (error) {
        console.error('❌ Error decoding token:', error.message);
        throw error;
    }
};

// ============================================
// CREATE REFRESH TOKEN
// ============================================

/**
 * Create a refresh token
 * @param {string} userId - User's unique ID
 * @returns {string} Refresh token
 */
const createRefreshToken = (userId) => {
    try {
        if (!JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined in .env file');
        }

        const payload = {
            userId,
            type: 'refresh',
            iat: Math.floor(Date.now() / 1000)
        };

        const token = jwt.sign(payload, JWT_SECRET, {
            expiresIn: TOKEN_EXPIRY.REFRESH_TOKEN,
            algorithm: 'HS256'
        });

        return token;

    } catch (error) {
        console.error('❌ Error creating refresh token:', error.message);
        throw error;
    }
};

// ============================================
// VERIFY REFRESH TOKEN
// ============================================

/**
 * Verify refresh token and create new access token
 * @param {string} refreshToken - Refresh token to verify
 * @returns {string} New access token
 */
const refreshAccessToken = (refreshToken) => {
    try {
        // Verify refresh token
        const decoded = verifyToken(refreshToken);

        if (decoded.type !== 'refresh') {
            throw new Error('Not a valid refresh token');
        }

        // Create new access token
        const newAccessToken = createToken(decoded.userId, {
            refreshed: true
        });

        return newAccessToken;

    } catch (error) {
        console.error('❌ Error refreshing token:', error.message);
        throw error;
    }
};

// ============================================
// GET USER ID FROM TOKEN
// ============================================

/**
 * Extract user ID from token
 * @param {string} token - JWT token
 * @returns {string} User ID
 */
const getUserIdFromToken = (token) => {
    try {
        const decoded = verifyToken(token);
        return decoded.userId;
    } catch (error) {
        throw new Error('Could not extract user ID from token');
    }
};

// ============================================
// EXPORTS
// ============================================

module.exports = {
    createToken,
    generateToken,      // Added generateToken
    verifyToken,
    decodeToken,
    createRefreshToken,
    refreshAccessToken,
    getUserIdFromToken,
    TOKEN_EXPIRY
};