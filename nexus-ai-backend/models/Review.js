// ============================================
// REVIEW MODEL
// Schema for tool reviews in MongoDB
// ============================================

const mongoose = require('mongoose');

// ============================================
// REVIEW SCHEMA
// ============================================

const reviewSchema = new mongoose.Schema({
    // Rating & Content
    rating: {
        type: Number,
        required: [true, 'Please provide a rating'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5'],
        enum: [1, 2, 3, 4, 5]
    },

    title: {
        type: String,
        required: [true, 'Please provide a review title'],
        trim: true,
        minlength: [5, 'Title must be at least 5 characters'],
        maxlength: [100, 'Title must not exceed 100 characters']
    },

    content: {
        type: String,
        required: [true, 'Please provide review content'],
        minlength: [10, 'Review must be at least 10 characters'],
        maxlength: [2000, 'Review must not exceed 2000 characters']
    },

    // References
    tool: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tool',
        required: true
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Review Aspects (specific feedback)
    aspects: {
        easeOfUse: {
            type: Number,
            min: 1,
            max: 5
        },
        features: {
            type: Number,
            min: 1,
            max: 5
        },
        pricing: {
            type: Number,
            min: 1,
            max: 5
        },
        customerSupport: {
            type: Number,
            min: 1,
            max: 5
        }
    },

    // Engagement
    helpfulCount: {
        type: Number,
        default: 0,
        min: [0, 'Helpful count cannot be negative']
    },

    unhelpfulCount: {
        type: Number,
        default: 0,
        min: [0, 'Unhelpful count cannot be negative']
    },

    // Review Status
    isVerified: {
        type: Boolean,
        default: false
    },

    isFeatured: {
        type: Boolean,
        default: false
    },

    isApproved: {
        type: Boolean,
        default: true
    },

    isFlagged: {
        type: Boolean,
        default: false
    },

    flagReason: {
        type: String,
        enum: ['spam', 'offensive', 'irrelevant', 'duplicate', null],
        default: null
    },

    // Metadata
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
// INDEXES
// ============================================

reviewSchema.index({ tool: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ helpfulCount: -1 });
reviewSchema.index({ isApproved: 1, createdAt: -1 });
reviewSchema.index({ isFeatured: 1, rating: -1 });

// ============================================
// PRE-SAVE MIDDLEWARE
// ============================================

reviewSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// ============================================
// REVIEW METHODS
// ============================================

reviewSchema.methods.addHelpfulVote = async function () {
    try {
        this.helpfulCount += 1;
        await this.save();
        return this;
    } catch (error) {
        throw new Error('Error adding helpful vote');
    }
};

reviewSchema.methods.removeHelpfulVote = async function () {
    try {
        if (this.helpfulCount > 0) {
            this.helpfulCount -= 1;
        }
        await this.save();
        return this;
    } catch (error) {
        throw new Error('Error removing helpful vote');
    }
};

reviewSchema.methods.addUnhelpfulVote = async function () {
    try {
        this.unhelpfulCount += 1;
        await this.save();
        return this;
    } catch (error) {
        throw new Error('Error adding unhelpful vote');
    }
};

reviewSchema.methods.removeUnhelpfulVote = async function () {
    try {
        if (this.unhelpfulCount > 0) {
            this.unhelpfulCount -= 1;
        }
        await this.save();
        return this;
    } catch (error) {
        throw new Error('Error removing unhelpful vote');
    }
};

reviewSchema.methods.getHelpfulnessPercentage = function () {
    const total = this.helpfulCount + this.unhelpfulCount;
    
    if (total === 0) {
        return 0;
    }
    
    return Math.round((this.helpfulCount / total) * 100);
};

reviewSchema.methods.flagReview = async function (reason) {
    try {
        if (!['spam', 'offensive', 'irrelevant', 'duplicate'].includes(reason)) {
            throw new Error('Invalid flag reason');
        }
        
        this.isFlagged = true;
        this.flagReason = reason;
        await this.save();
        return this;
    } catch (error) {
        throw new Error('Error flagging review: ' + error.message);
    }
};

reviewSchema.methods.approveReview = async function () {
    try {
        this.isApproved = true;
        this.isFlagged = false;
        this.flagReason = null;
        await this.save();
        return this;
    } catch (error) {
        throw new Error('Error approving review');
    }
};

reviewSchema.methods.rejectReview = async function () {
    try {
        this.isApproved = false;
        await this.save();
        return this;
    } catch (error) {
        throw new Error('Error rejecting review');
    }
};

reviewSchema.methods.featureReview = async function () {
    try {
        this.isFeatured = true;
        await this.save();
        return this;
    } catch (error) {
        throw new Error('Error featuring review');
    }
};

reviewSchema.methods.unfeatureReview = async function () {
    try {
        this.isFeatured = false;
        await this.save();
        return this;
    } catch (error) {
        throw new Error('Error unfeaturing review');
    }
};

reviewSchema.methods.getFullReview = async function () {
    try {
        return await mongoose.model('Review')
            .findById(this._id)
            .populate('user', 'name profilePhoto')
            .populate('tool', 'name slug logo');
    } catch (error) {
        throw new Error('Error fetching full review');
    }
};

reviewSchema.methods.getSummary = function () {
    return {
        _id: this._id,
        rating: this.rating,
        title: this.title,
        content: this.content.substring(0, 100) + '...',
        helpfulCount: this.helpfulCount,
        unhelpfulCount: this.unhelpfulCount,
        helpfulnessPercentage: this.getHelpfulnessPercentage(),
        createdAt: this.createdAt
    };
};

reviewSchema.methods.isValidReview = function () {
    return this.isApproved === true && this.isFlagged === false;
};

// ============================================
// CREATE AND EXPORT MODEL
// ============================================

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
