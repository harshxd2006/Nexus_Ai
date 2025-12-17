// ============================================
// USER MODEL
// Schema for user data in MongoDB
// ============================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

// ============================================
// USER SCHEMA
// ============================================

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [50, 'Name must not exceed 50 characters']
    },

    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },

    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false
    },

    profilePhoto: {
        type: String,
        default: null
    },

    bio: {
        type: String,
        maxlength: [500, 'Bio must not exceed 500 characters'],
        default: null
    },

    isVerified: {
        type: Boolean,
        default: false
    },

    isActive: {
        type: Boolean,
        default: true
    },

    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },

    favoriteTools: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tool'
        }
    ],

    // OTP & EMAIL VERIFICATION FIELDS
    verificationOTP: {
        type: String,
        default: null
    },

    otpExpiration: {
        type: Date,
        default: null
    },

    // PASSWORD RESET FIELDS
    passwordResetToken: {
        type: String,
        default: null
    },

    passwordResetExpiration: {
        type: Date,
        default: null
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// ============================================
// PRE-SAVE MIDDLEWARE (Hash password)
// ============================================

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        this.updatedAt = Date.now();
        next();
    } catch (error) {
        next(error);
    }
});

// ============================================
// USER METHODS
// ============================================

userSchema.methods.comparePassword = async function (providedPassword) {
    try {
        return await bcrypt.compare(providedPassword, this.password);
    } catch (error) {
        throw new Error('Error comparing passwords');
    }
};

userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    delete user.verificationOTP;
    delete user.passwordResetToken;
    return user;
};

userSchema.methods.isUserVerified = function () {
    return this.isVerified === true;
};

userSchema.methods.isUserActive = function () {
    return this.isActive === true;
};

userSchema.methods.addFavoriteTool = async function (toolId) {
    try {
        if (!this.favoriteTools.includes(toolId)) {
            this.favoriteTools.push(toolId);
            await this.save();
        }
        return this;
    } catch (error) {
        throw new Error('Error adding favorite tool');
    }
};

userSchema.methods.removeFavoriteTool = async function (toolId) {
    try {
        this.favoriteTools = this.favoriteTools.filter(
            id => id.toString() !== toolId.toString()
        );
        await this.save();
        return this;
    } catch (error) {
        throw new Error('Error removing favorite tool');
    }
};

// ============================================
// USER INDEXES
// ============================================

userSchema.index({ email: 1 });
userSchema.index({ name: 'text' });
userSchema.index({ createdAt: -1 });

// ============================================
// CREATE AND EXPORT MODEL
// ============================================

const User = mongoose.model('User', userSchema);

module.exports = User;