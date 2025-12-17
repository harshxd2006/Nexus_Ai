// ============================================
// TOOL MODEL
// Schema for AI tools in MongoDB
// ============================================

const mongoose = require('mongoose');
const validator = require('validator');

// ============================================
// TOOL SCHEMA
// ============================================

const toolSchema = new mongoose.Schema({
    // Basic Information
    name: {
        type: String,
        required: [true, 'Please provide a tool name'],
        trim: true,
        minlength: [3, 'Tool name must be at least 3 characters'],
        maxlength: [100, 'Tool name must not exceed 100 characters'],
        unique: true
    },

    slug: {
        type: String,
        lowercase: true,
        unique: true
    },

    description: {
        type: String,
        required: [true, 'Please provide a description'],
        minlength: [10, 'Description must be at least 10 characters'],
        maxlength: [2000, 'Description must not exceed 2000 characters']
    },

    // URLs
    website: {
        type: String,
        required: [true, 'Please provide website URL'],
        validate: [validator.isURL, 'Please provide a valid URL'],
        lowercase: true
    },

    logo: {
        type: String,
        validate: [validator.isURL, 'Please provide a valid logo URL']
    },

    // Categorization
    category: {
        type: String,
        required: [true, 'Please select a category'],
        enum: [
            'AI Writing',
            'AI Image Generation',
            'AI Coding',
            'AI Video',
            'AI Voice',
            'AI Chatbot',
            'AI Analytics',
            'AI SEO',
            'AI Design',
            'AI Music',
            'Other'
        ]
    },

    tags: {
        type: [String],
        default: [],
        validate: {
            validator: function(v) {
                return v.length <= 10;
            },
            message: 'Tool can have maximum 10 tags'
        }
    },

    // Features
    features: {
        type: [String],
        default: [],
        maxlength: [10, 'Tool can have maximum 10 features']
    },

    // Pricing
    pricing: {
        type: {
            type: String,
            enum: ['Free', 'Freemium', 'Paid', 'Open Source'],
            required: true
        },
        startingPrice: {
            type: Number,
            min: [0, 'Price cannot be negative']
        },
        currency: {
            type: String,
            default: 'USD'
        }
    },

    // Rating & Reviews
    averageRating: {
        type: Number,
        default: 0,
        min: [0, 'Rating cannot be less than 0'],
        max: [5, 'Rating cannot exceed 5']
    },

    totalReviews: {
        type: Number,
        default: 0,
        min: [0, 'Total reviews cannot be negative']
    },

    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],

    // Engagement
    usageCount: {
        type: Number,
        default: 0,
        min: [0, 'Usage count cannot be negative']
    },

    viewCount: {
        type: Number,
        default: 0,
        min: [0, 'View count cannot be negative']
    },

    favoritedBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],

    // Social Proof
    upvotes: {
        type: Number,
        default: 0,
        min: [0, 'Upvotes cannot be negative']
    },

    // Metadata
    isVerified: {
        type: Boolean,
        default: false
    },

    isActive: {
        type: Boolean,
        default: true
    },

    isPopular: {
        type: Boolean,
        default: false
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Timestamps
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
// PRE-SAVE MIDDLEWARE (Generate slug)
// ============================================

toolSchema.pre('save', function (next) {
    if (!this.slug) {
        this.slug = this.name
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    }

    this.updatedAt = Date.now();
    next();
});

// ============================================
// TOOL METHODS
// ============================================

toolSchema.methods.updateAverageRating = async function (newRating) {
    try {
        const Review = mongoose.model('Review');

        const reviews = await Review.find({ tool: this._id });

        if (reviews.length === 0) {
            this.averageRating = 0;
            this.totalReviews = 0;
        } else {
            const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
            this.averageRating = sum / reviews.length;
            this.totalReviews = reviews.length;
        }

        await this.save();
        return this;

    } catch (error) {
        throw new Error('Error updating average rating');
    }
};

toolSchema.methods.incrementViewCount = async function () {
    try {
        this.viewCount += 1;
        await this.save();
        return this;
    } catch (error) {
        throw new Error('Error incrementing view count');
    }
};

toolSchema.methods.incrementUsageCount = async function () {
    try {
        this.usageCount += 1;
        await this.save();
        return this;
    } catch (error) {
        throw new Error('Error incrementing usage count');
    }
};

toolSchema.methods.addUpvote = async function () {
    try {
        this.upvotes += 1;
        await this.save();
        return this;
    } catch (error) {
        throw new Error('Error adding upvote');
    }
};

toolSchema.methods.getFullTool = async function () {
    try {
        return await mongoose.model('Tool')
            .findById(this._id)
            .populate('createdBy', 'name email profilePhoto')
            .populate('reviews');
    } catch (error) {
        throw new Error('Error fetching full tool');
    }
};

toolSchema.methods.isFavoritedBy = function (userId) {
    return this.favoritedBy.some(id => id.toString() === userId.toString());
};

toolSchema.methods.addToFavorites = async function (userId) {
    try {
        if (!this.favoritedBy.includes(userId)) {
            this.favoritedBy.push(userId);
            await this.save();
        }
        return this;
    } catch (error) {
        throw new Error('Error adding to favorites');
    }
};

toolSchema.methods.removeFromFavorites = async function (userId) {
    try {
        this.favoritedBy = this.favoritedBy.filter(
            id => id.toString() !== userId.toString()
        );
        await this.save();
        return this;
    } catch (error) {
        throw new Error('Error removing from favorites');
    }
};

toolSchema.methods.getSummary = function () {
    return {
        _id: this._id,
        name: this.name,
        slug: this.slug,
        description: this.description.substring(0, 150) + '...',
        category: this.category,
        logo: this.logo,
        website: this.website,
        averageRating: this.averageRating,
        totalReviews: this.totalReviews,
        pricing: this.pricing.type,
        favoritedCount: this.favoritedBy.length,
        viewCount: this.viewCount
    };
};

// ============================================
// TOOL INDEXES
// ============================================

toolSchema.index({ name: 'text', description: 'text' });
toolSchema.index({ category: 1 });
toolSchema.index({ slug: 1 });
toolSchema.index({ averageRating: -1 });
toolSchema.index({ createdAt: -1 });
toolSchema.index({ isPopular: 1, createdAt: -1 });

// ============================================
// CREATE AND EXPORT MODEL
// ============================================

const Tool = mongoose.model('Tool', toolSchema);

module.exports = Tool;
