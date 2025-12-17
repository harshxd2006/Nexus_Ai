const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// ============================================
// AUTHENTICATION ROUTES
// ============================================

// Register & Login
router.post('/register', authController.register);
router.post('/signup', authController.register); // Alias for register
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Token Management
router.post('/refresh-token', authController.refreshToken);
router.get('/verify-token', authController.verifyTokenValidity);

// OTP Routes
router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);

// Password Management
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// User Info
router.get('/me', authController.getCurrentUser);
router.get('/check-email', authController.checkEmailExists);

module.exports = router;