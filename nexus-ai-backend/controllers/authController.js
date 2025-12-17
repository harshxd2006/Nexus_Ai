// ============================================
// AUTH CONTROLLER
// Authentication business logic
// ============================================

const User = require('../models/User');
const { generateToken, verifyToken } = require('../config/jwt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// ============================================
// EMAIL TRANSPORTER SETUP
// ============================================

const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// ============================================
// REGISTER
// User signup
// ============================================

exports.register = async (req, res) => {
    try {
        // DEBUG: Log what we received
        console.log('📥 Register request body:', req.body);
        
        const { name, email, password, confirmPassword, passwordConfirm } = req.body;

        // Accept both confirmPassword and passwordConfirm
        const finalConfirmPassword = confirmPassword || passwordConfirm;
        
        console.log('📝 Extracted values:');
        console.log('  - name:', name);
        console.log('  - email:', email);
        console.log('  - password:', password ? '***' : undefined);
        console.log('  - confirmPassword:', confirmPassword ? '***' : undefined);
        console.log('  - passwordConfirm:', passwordConfirm ? '***' : undefined);
        console.log('  - finalConfirmPassword:', finalConfirmPassword ? '***' : undefined);

        if (!name || !email || !password || !finalConfirmPassword) {
            console.log('❌ Validation failed: Missing required fields');
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields',
                debug: {
                    hasName: !!name,
                    hasEmail: !!email,
                    hasPassword: !!password,
                    hasConfirmPassword: !!finalConfirmPassword
                }
            });
        }

        if (password !== finalConfirmPassword) {
            console.log('❌ Validation failed: Passwords do not match');
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        if (password.length < 6) {
            console.log('❌ Validation failed: Password too short');
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        if (name.length < 2 || name.length > 50) {
            console.log('❌ Validation failed: Invalid name length');
            return res.status(400).json({
                success: false,
                message: 'Name must be between 2 and 50 characters'
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            console.log('❌ Validation failed: Email already exists');
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        console.log('✅ Creating new user...');
        const user = await User.create({
            name,
            email,
            password
        });

        console.log('✅ User created successfully, generating token...');
        const token = generateToken(user._id);

        user.password = undefined;

        console.log('✅ Registration complete!');
        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user,
                token
            }
        });

    } catch (error) {
        console.error('❌ Register error:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages[0]
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Error registering user',
            error: error.message
        });
    }
};

// ============================================
// LOGIN
// User signin
// ============================================

exports.login = async (req, res) => {
    try {
        console.log('📥 Login request body:', req.body);
        
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been suspended'
            });
        }

        const isPasswordCorrect = await user.comparePassword(password);

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const token = generateToken(user._id);

        user.password = undefined;

        console.log('✅ Login successful');
        return res.status(200).json({
            success: true,
            message: 'Logged in successfully',
            data: {
                user,
                token
            }
        });

    } catch (error) {
        console.error('❌ Login error:', error);

        return res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: error.message
        });
    }
};

// ============================================
// LOGOUT
// ============================================

exports.logout = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        console.error('❌ Logout error:', error);

        return res.status(500).json({
            success: false,
            message: 'Error logging out',
            error: error.message
        });
    }
};

// ============================================
// REFRESH TOKEN
// Generate new access token using refresh token
// ============================================

exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token required'
            });
        }

        const decoded = verifyToken(refreshToken);

        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const newToken = generateToken(user._id);

        return res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                token: newToken
            }
        });

    } catch (error) {
        console.error('❌ Refresh token error:', error);

        return res.status(401).json({
            success: false,
            message: 'Invalid refresh token',
            error: error.message
        });
    }
};

// ============================================
// SEND OTP
// Send verification OTP to email
// ============================================

exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email required'
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        user.verificationOTP = otp;
        user.otpExpiration = Date.now() + 10 * 60 * 1000;
        await user.save();

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your Verification Code',
            html: `
                <h2>Email Verification</h2>
                <p>Your verification code is:</p>
                <h1>${otp}</h1>
                <p>This code will expire in 10 minutes.</p>
                <p>Do not share this code with anyone.</p>
            `
        });

        return res.status(200).json({
            success: true,
            message: 'OTP sent to email'
        });

    } catch (error) {
        console.error('❌ Send OTP error:', error);

        return res.status(500).json({
            success: false,
            message: 'Error sending OTP',
            error: error.message
        });
    }
};

// ============================================
// VERIFY OTP
// Verify email with OTP
// ============================================

exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP required'
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.verificationOTP !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        if (Date.now() > user.otpExpiration) {
            return res.status(400).json({
                success: false,
                message: 'OTP expired'
            });
        }

        user.isVerified = true;
        user.verificationOTP = null;
        user.otpExpiration = null;
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Email verified successfully'
        });

    } catch (error) {
        console.error('❌ Verify OTP error:', error);

        return res.status(500).json({
            success: false,
            message: 'Error verifying OTP',
            error: error.message
        });
    }
};

// ============================================
// FORGOT PASSWORD
// Send password reset link
// ============================================

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email required'
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        user.passwordResetToken = hashedToken;
        user.passwordResetExpiration = Date.now() + 30 * 60 * 1000;
        await user.save();

        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Link',
            html: `
                <h2>Password Reset</h2>
                <p>Click the link below to reset your password:</p>
                <a href="${resetLink}">${resetLink}</a>
                <p>This link will expire in 30 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `
        });

        return res.status(200).json({
            success: true,
            message: 'Password reset link sent to email'
        });

    } catch (error) {
        console.error('❌ Forgot password error:', error);

        return res.status(500).json({
            success: false,
            message: 'Error sending reset link',
            error: error.message
        });
    }
};

// ============================================
// RESET PASSWORD
// Update password with reset token
// ============================================

exports.resetPassword = async (req, res) => {
    try {
        const { resetToken, newPassword, confirmPassword } = req.body;

        if (!resetToken || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'All fields required'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpiration: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        user.password = newPassword;
        user.passwordResetToken = null;
        user.passwordResetExpiration = null;
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Password reset successfully'
        });

    } catch (error) {
        console.error('❌ Reset password error:', error);

        return res.status(500).json({
            success: false,
            message: 'Error resetting password',
            error: error.message
        });
    }
};

// ============================================
// GET CURRENT USER
// Get logged-in user info
// ============================================

exports.getCurrentUser = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const decoded = verifyToken(token);

        const user = await User.findById(decoded.userId)
            .populate('favoriteTools', 'name slug logo category averageRating');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Current user retrieved',
            data: {
                user
            }
        });

    } catch (error) {
        console.error('❌ Get current user error:', error);

        return res.status(401).json({
            success: false,
            message: 'Invalid token',
            error: error.message
        });
    }
};

// ============================================
// VERIFY TOKEN
// Check if token is valid
// ============================================

exports.verifyTokenValidity = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const decoded = verifyToken(token);

        return res.status(200).json({
            success: true,
            message: 'Token is valid',
            data: {
                userId: decoded.userId,
                expiresAt: new Date(decoded.exp * 1000)
            }
        });

    } catch (error) {
        console.error('❌ Verify token error:', error);

        return res.status(401).json({
            success: false,
            message: 'Invalid token',
            error: error.message
        });
    }
};

// ============================================
// CHECK EMAIL EXISTS
// Check if email is already registered
// ============================================

exports.checkEmailExists = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email required'
            });
        }

        const user = await User.findOne({ email });

        return res.status(200).json({
            success: true,
            data: {
                exists: !!user
            }
        });

    } catch (error) {
        console.error('❌ Check email error:', error);

        return res.status(500).json({
            success: false,
            message: 'Error checking email',
            error: error.message
        });
    }
};