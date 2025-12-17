// ============================================
// REVIEW CONTROLLER
// Review management business logic
// ============================================

const Review = require('../models/Review');
const Tool = require('../models/Tool');
const User = require('../models/User');

// ============================================
// CREATE REVIEW
// ============================================

exports.createReview = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const { verifyToken } = require('../config/jwt');
        const decoded = verifyToken(token);
        const userId = decoded.userId;

        const { toolId, rating, title, content, aspects } = req.body;

        // Validation
        if (!toolId || !rating || !title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        if (title.length < 3 || title.length > 100) {
            return res.status(400).json({
                success: false,
                message: 'Title must be between 3 and 100 characters'
            });
        }

        if (content.length < 10) {
            return res.status(400).json({
                success: false,
                message: 'Review content must be at least 10 characters'
            });
        }

        // Check if tool exists
        const tool = await Tool.findById(toolId);

        if (!tool) {
            return res.status(404).json({
                success: false,
                message: 'Tool not found'
            });
        }

        // Check if user already reviewed this tool
        const existingReview = await Review.findOne({
            user: userId,
            tool: toolId
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this tool'
            });
        }

        // Create review
        const review = await Review.create({
            rating,
            title,
            content,
            tool: toolId,
            user: userId,
            aspects: aspects || {}
        });

        // Update tool's average rating
        await tool.updateAverageRating();

        // Populate user and tool info
        await review.populate('user', 'name email profilePhoto');
        await review.populate('tool', 'name slug logo');

        return res.status(201).json({
            success: true,
            message: 'Review created successfully',
            data: {
                review: review.getSummary()
            }
        });

    } catch (error) {
        console.error('Create review error:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages[0]
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Error creating review',
            error: error.message
        });
    }
};

// ============================================
// GET ALL REVIEWS
// ============================================

exports.getReviews = async (req, res) => {
    try {
        const {
            toolId,
            userId,
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            order = 'desc',
            minRating = 1,
            maxRating = 5
        } = req.query;

        let filter = { isApproved: true, isFlagged: false };

        if (toolId) {
            filter.tool = toolId;
        }

        if (userId) {
            filter.user = userId;
        }

        if (minRating || maxRating) {
            filter.rating = {
                $gte: minRating,
                $lte: maxRating
            };
        }

        const totalReviews = await Review.countDocuments(filter);

        let query = Review.find(filter);

        const sortOrder = order === 'asc' ? 1 : -1;
        query = query.sort({ [sortBy]: sortOrder });

        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(parseInt(limit));

        const reviews = await query
            .populate('user', 'name email profilePhoto')
            .populate('tool', 'name slug logo');

        return res.status(200).json({
            success: true,
            message: 'Reviews retrieved successfully',
            data: {
                reviews: reviews.map(review => review.getSummary()),
                pagination: {
                    totalReviews,
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalReviews / limit),
                    limit: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Get reviews error:', error);

        return res.status(500).json({
            success: false,
            message: 'Error fetching reviews',
            error: error.message
        });
    }
};

// ============================================
// GET SINGLE REVIEW
// ============================================

exports.getReviewById = async (req, res) => {
    try {
        const { reviewId } = req.params;

        const review = await Review.findById(reviewId)
            .populate('user', 'name email profilePhoto')
            .populate('tool', 'name slug logo');

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        const fullReview = await review.getFullReview();

        return res.status(200).json({
            success: true,
            message: 'Review retrieved successfully',
            data: {
                review: {
                    _id: fullReview._id,
                    rating: fullReview.rating,
                    title: fullReview.title,
                    content: fullReview.content,
                    aspects: fullReview.aspects,
                    user: fullReview.user,
                    tool: fullReview.tool,
                    helpfulCount: fullReview.helpfulCount,
                    unhelpfulCount: fullReview.unhelpfulCount,
                    helpfulnessPercentage: fullReview.getHelpfulnessPercentage(),
                    isVerified: fullReview.isVerified,
                    isFeatured: fullReview.isFeatured,
                    isApproved: fullReview.isApproved,
                    isFlagged: fullReview.isFlagged,
                    flagReason: fullReview.flagReason,
                    createdAt: fullReview.createdAt,
                    updatedAt: fullReview.updatedAt
                }
            }
        });

    } catch (error) {
        console.error('Get review error:', error);

        return res.status(500).json({
            success: false,
            message: 'Error fetching review',
            error: error.message
        });
    }
};

// ============================================
// UPDATE REVIEW
// ============================================

exports.updateReview = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const { verifyToken } = require('../config/jwt');
        const decoded = verifyToken(token);
        const userId = decoded.userId;

        const { reviewId } = req.params;
        const { rating, title, content, aspects } = req.body;

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Check authorization
        if (review.user.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Only review author can update'
            });
        }

        // Update fields
        if (rating) {
            if (rating < 1 || rating > 5) {
                return res.status(400).json({
                    success: false,
                    message: 'Rating must be between 1 and 5'
                });
            }
            review.rating = rating;
        }

        if (title) {
            if (title.length < 3 || title.length > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'Title must be between 3 and 100 characters'
                });
            }
            review.title = title;
        }

        if (content) {
            if (content.length < 10) {
                return res.status(400).json({
                    success: false,
                    message: 'Content must be at least 10 characters'
                });
            }
            review.content = content;
        }

        if (aspects) review.aspects = aspects;

        await review.save();

        // Update tool's average rating
        const tool = await Tool.findById(review.tool);
        if (tool) {
            await tool.updateAverageRating();
        }

        return res.status(200).json({
            success: true,
            message: 'Review updated successfully',
            data: {
                review: review.getSummary()
            }
        });

    } catch (error) {
        console.error('Update review error:', error);

        return res.status(500).json({
            success: false,
            message: 'Error updating review',
            error: error.message
        });
    }
};

// ============================================
// DELETE REVIEW
// ============================================

exports.deleteReview = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const { verifyToken } = require('../config/jwt');
        const decoded = verifyToken(token);
        const userId = decoded.userId;

        const { reviewId } = req.params;

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Check authorization
        if (review.user.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Only review author can delete'
            });
        }

        // Delete review
        await Review.findByIdAndDelete(reviewId);

        // Update tool's average rating
        const tool = await Tool.findById(review.tool);
        if (tool) {
            await tool.updateAverageRating();
        }

        return res.status(200).json({
            success: true,
            message: 'Review deleted successfully',
            data: {
                deletedReviewId: reviewId
            }
        });

    } catch (error) {
        console.error('Delete review error:', error);

        return res.status(500).json({
            success: false,
            message: 'Error deleting review',
            error: error.message
        });
    }
};

// ============================================
// MARK HELPFUL
// ============================================

exports.markHelpful = async (req, res) => {
    try {
        const { reviewId } = req.params;

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        await review.addHelpfulVote();

        return res.status(200).json({
            success: true,
            message: 'Review marked as helpful',
            data: {
                reviewId: review._id,
                helpfulCount: review.helpfulCount,
                unhelpfulCount: review.unhelpfulCount,
                helpfulnessPercentage: review.getHelpfulnessPercentage()
            }
        });

    } catch (error) {
        console.error('Mark helpful error:', error);

        return res.status(500).json({
            success: false,
            message: 'Error marking as helpful',
            error: error.message
        });
    }
};

// ============================================
// REMOVE HELPFUL VOTE
// ============================================

exports.removeHelpful = async (req, res) => {
    try {
        const { reviewId } = req.params;

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        await review.removeHelpfulVote();

        return res.status(200).json({
            success: true,
            message: 'Helpful vote removed',
            data: {
                reviewId: review._id,
                helpfulCount: review.helpfulCount,
                unhelpfulCount: review.unhelpfulCount,
                helpfulnessPercentage: review.getHelpfulnessPercentage()
            }
        });

    } catch (error) {
        console.error('Remove helpful error:', error);

        return res.status(500).json({
            success: false,
            message: 'Error removing helpful vote',
            error: error.message
        });
    }
};

// ============================================
// MARK UNHELPFUL
// ============================================

exports.markUnhelpful = async (req, res) => {
    try {
        const { reviewId } = req.params;

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        await review.addUnhelpfulVote();

        return res.status(200).json({
            success: true,
            message: 'Review marked as unhelpful',
            data: {
                reviewId: review._id,
                helpfulCount: review.helpfulCount,
                unhelpfulCount: review.unhelpfulCount,
                helpfulnessPercentage: review.getHelpfulnessPercentage()
            }
        });

    } catch (error) {
        console.error('Mark unhelpful error:', error);

        return res.status(500).json({
            success: false,
            message: 'Error marking as unhelpful',
            error: error.message
        });
    }
};

// ============================================
// REMOVE UNHELPFUL VOTE
// ============================================

exports.removeUnhelpful = async (req, res) => {
    try {
        const { reviewId } = req.params;

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        await review.removeUnhelpfulVote();

        return res.status(200).json({
            success: true,
            message: 'Unhelpful vote removed',
            data: {
                reviewId: review._id,
                helpfulCount: review.helpfulCount,
                unhelpfulCount: review.unhelpfulCount,
                helpfulnessPercentage: review.getHelpfulnessPercentage()
            }
        });

    } catch (error) {
        console.error('Remove unhelpful error:', error);

        return res.status(500).json({
            success: false,
            message: 'Error removing unhelpful vote',
            error: error.message
        });
    }
};

// ============================================
// FLAG REVIEW
// ============================================

exports.flagReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Please provide flag reason'
            });
        }

        const validReasons = ['spam', 'offensive', 'irrelevant', 'duplicate'];
        if (!validReasons.includes(reason)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid flag reason'
            });
        }

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        await review.flagReview(reason);

        return res.status(200).json({
            success: true,
            message: 'Review flagged for moderation',
            data: {
                reviewId: review._id,
                isFlagged: review.isFlagged,
                flagReason: review.flagReason
            }
        });

    } catch (error) {
        console.error('Flag review error:', error);

        return res.status(500).json({
            success: false,
            message: 'Error flagging review',
            error: error.message
        });
    }
};

// ============================================
// APPROVE REVIEW (Admin)
// ============================================

exports.approveReview = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const { verifyToken } = require('../config/jwt');
        const decoded = verifyToken(token);
        const userId = decoded.userId;

        // Check if user is admin
        const user = await User.findById(userId);
        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admins can approve reviews'
            });
        }

        const { reviewId } = req.params;

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        await review.approveReview();

        return res.status(200).json({
            success: true,
            message: 'Review approved',
            data: {
                reviewId: review._id,
                isApproved: review.isApproved,
                isFlagged: review.isFlagged
            }
        });

    } catch (error) {
        console.error('Approve review error:', error);

        return res.status(500).json({
            success: false,
            message: 'Error approving review',
            error: error.message
        });
    }
};

// ============================================
// REJECT REVIEW (Admin)
// ============================================

exports.rejectReview = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const { verifyToken } = require('../config/jwt');
        const decoded = verifyToken(token);
        const userId = decoded.userId;

        // Check if user is admin
        const user = await User.findById(userId);
        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admins can reject reviews'
            });
        }

        const { reviewId } = req.params;

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        await review.rejectReview();

        return res.status(200).json({
            success: true,
            message: 'Review rejected',
            data: {
                reviewId: review._id,
                isApproved: review.isApproved
            }
        });

    } catch (error) {
        console.error('Reject review error:', error);

        return res.status(500).json({
            success: false,
            message: 'Error rejecting review',
            error: error.message
        });
    }
};

// ============================================
// FEATURE REVIEW (Admin)
// ============================================

exports.featureReview = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const { verifyToken } = require('../config/jwt');
        const decoded = verifyToken(token);
        const userId = decoded.userId;

        // Check if user is admin
        const user = await User.findById(userId);
        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admins can feature reviews'
            });
        }

        const { reviewId } = req.params;

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        await review.featureReview();

        return res.status(200).json({
            success: true,
            message: 'Review featured',
            data: {
                reviewId: review._id,
                isFeatured: review.isFeatured
            }
        });

    } catch (error) {
        console.error('Feature review error:', error);

        return res.status(500).json({
            success: false,
            message: 'Error featuring review',
            error: error.message
        });
    }
};

// ============================================
// UNFEATURE REVIEW (Admin)
// ============================================

exports.unfeatureReview = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }

        const { verifyToken } = require('../config/jwt');
        const decoded = verifyToken(token);
        const userId = decoded.userId;

        // Check if user is admin
        const user = await User.findById(userId);
        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admins can unfeature reviews'
            });
        }

        const { reviewId } = req.params;

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        await review.unfeatureReview();

        return res.status(200).json({
            success: true,
            message: 'Review unfeatured',
            data: {
                reviewId: review._id,
                isFeatured: review.isFeatured
            }
        });

    } catch (error) {
        console.error('Unfeature review error:', error);

        return res.status(500).json({
            success: false,
            message: 'Error unfeaturing review',
            error: error.message
        });
    }
};

// ============================================
// GET FEATURED REVIEWS
// ============================================

exports.getFeaturedReviews = async (req, res) => {
    try {
        const { limit = 5 } = req.query;

        const featuredReviews = await Review.find({
            isFeatured: true,
            isApproved: true
        })
            .limit(parseInt(limit))
            .sort({ createdAt: -1 })
            .populate('user', 'name email profilePhoto')
            .populate('tool', 'name slug logo');

        return res.status(200).json({
            success: true,
            message: 'Featured reviews',
            data: {
                reviews: featuredReviews.map(review => review.getSummary())
            }
        });

    } catch (error) {
        console.error('Get featured reviews error:', error);

        return res.status(500).json({
            success: false,
            message: 'Error fetching featured reviews',
            error: error.message
        });
    }
};

// ============================================
// EXPORTS
// ============================================

module.exports = exports;
