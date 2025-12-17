// ============================================
// USER CONTROLLER - FIXED VERSION
// User management business logic
// ============================================

const User = require('../models/User');
const Tool = require('../models/Tool');
const Review = require('../models/Review');

// ============================================
// GET USER PROFILE
// ============================================

exports.getUserProfile = async (req, res) => {
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

        const user = await User.findById(userId)
            .select('-password')
            .populate('favoriteTools', 'name slug logo category averageRating');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get user statistics
        const reviewsCount = await Review.countDocuments({ user: userId });
        const toolsCount = await Tool.countDocuments({ createdBy: userId });

        return res.status(200).json({
            success: true,
            message: 'User profile retrieved successfully',
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    profilePhoto: user.profilePhoto,
                    bio: user.bio,
                    role: user.role,
                    isVerified: user.isVerified,
                    favoriteTools: user.favoriteTools,
                    favoritesCount: user.favoriteTools.length,
                    reviewsCount: reviewsCount,
                    toolsCount: toolsCount,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            }
        });

    } catch (error) {
        console.error('Get profile error:', error);

        return res.status(500).json({
            success: false,
            message: 'Error fetching profile',
            error: error.message
        });
    }
};

// ============================================
// GET USER BY ID
// ============================================

exports.getUserById = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId)
            .select('-password')
            .populate('favoriteTools', 'name slug logo category')
            .populate('createdTools', 'name slug logo category');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get user statistics
        const reviews = await Review.countDocuments({ user: userId });
        const tools = await Tool.countDocuments({ createdBy: userId });

        return res.status(200).json({
            success: true,
            message: 'User retrieved successfully',
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    profilePhoto: user.profilePhoto,
                    bio: user.bio,
                    role: user.role,
                    isVerified: user.isVerified,
                    favoriteTools: user.favoriteTools,
                    createdTools: user.createdTools,
                    reviewCount: reviews,
                    toolCount: tools,
                    createdAt: user.createdAt
                }
            }
        });

    } catch (error) {
        console.error('Get user error:', error);

        return res.status(500).json({
            success: false,
            message: 'Error fetching user',
            error: error.message
        });
    }
};

// ============================================
// UPDATE USER PROFILE
// ============================================

exports.updateUserProfile = async (req, res) => {
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

        const { name, bio, profilePhoto } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update fields
        if (name) {
            if (name.length < 2 || name.length > 50) {
                return res.status(400).json({
                    success: false,
                    message: 'Name must be between 2 and 50 characters'
                });
            }
            user.name = name;
        }

        if (bio !== undefined) {
            if (bio && bio.length > 500) {
                return res.status(400).json({
                    success: false,
                    message: 'Bio must be less than 500 characters'
                });
            }
            user.bio = bio;
        }

        if (profilePhoto !== undefined) {
            user.profilePhoto = profilePhoto;
        }

        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    profilePhoto: user.profilePhoto,
                    bio: user.bio
                }
            }
        });

    } catch (error) {
        console.error('Update profile error:', error);

        return res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message
        });
    }
};

// ============================================
// GET USER FAVORITE TOOLS - FIXED
// ============================================

exports.getUserFavorites = async (req, res) => {
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

        const { page = 1, limit = 10 } = req.query;

        const user = await User.findById(userId).select('favoriteTools');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const skip = (page - 1) * limit;
        const totalFavorites = user.favoriteTools.length;

        // Fetch the actual tool documents
        const favoriteTools = await Tool.find({
            _id: { $in: user.favoriteTools }
        })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('createdBy', 'name email profilePhoto');

        return res.status(200).json({
            success: true,
            message: 'Favorite tools retrieved',
            data: favoriteTools.map(tool => ({
                _id: tool._id,
                name: tool.name,
                slug: tool.slug,
                description: tool.description,
                logo: tool.logo,
                category: tool.category,
                averageRating: tool.averageRating,
                totalReviews: tool.totalReviews,
                pricing: tool.pricing,
                website: tool.website
            })),
            pagination: {
                totalFavorites,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalFavorites / limit),
                limit: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Get favorites error:', error);

        return res.status(500).json({
            success: false,
            message: 'Error fetching favorites',
            error: error.message
        });
    }
};

// ============================================
// GET USER REVIEWS - FIXED
// ============================================

exports.getUserReviews = async (req, res) => {
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

        const { page = 1, limit = 10 } = req.query;

        const totalReviews = await Review.countDocuments({ user: userId });

        const skip = (page - 1) * limit;

        const reviews = await Review.find({ user: userId })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('tool', 'name slug logo')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: 'User reviews retrieved',
            data: reviews.map(review => ({
                _id: review._id,
                rating: review.rating,
                title: review.title,
                content: review.content,
                tool: review.tool,
                helpfulCount: review.helpfulCount,
                unhelpfulCount: review.unhelpfulCount,
                createdAt: review.createdAt,
                updatedAt: review.updatedAt
            })),
            pagination: {
                totalReviews,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalReviews / limit),
                limit: parseInt(limit)
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
// GET USER CREATED TOOLS
// ============================================

exports.getUserTools = async (req, res) => {
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

        const { page = 1, limit = 10 } = req.query;

        const totalTools = await Tool.countDocuments({ createdBy: userId });

        const skip = (page - 1) * limit;

        const tools = await Tool.find({ createdBy: userId })
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: 'User tools retrieved',
            data: {
                tools: tools.map(tool => ({
                    _id: tool._id,
                    name: tool.name,
                    slug: tool.slug,
                    description: tool.description,
                    logo: tool.logo,
                    category: tool.category,
                    averageRating: tool.averageRating,
                    viewCount: tool.viewCount,
                    createdAt: tool.createdAt
                })),
                pagination: {
                    totalTools,
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalTools / limit),
                    limit: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Get tools error:', error);

        return res.status(500).json({
            success: false,
            message: 'Error fetching tools',
            error: error.message
        });
    }
};

// ============================================
// GET USER STATISTICS
// ============================================

exports.getUserStats = async (req, res) => {
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

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get statistics
        const reviewsCount = await Review.countDocuments({ user: userId });
        const toolsCount = await Tool.countDocuments({ createdBy: userId });
        const favoritesCount = user.favoriteTools.length;

        // Get average rating
        const userReviews = await Review.find({ user: userId });
        const averageRating = userReviews.length > 0
            ? (userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length).toFixed(1)
            : 0;

        // Get total helpful votes
        const totalHelpful = userReviews.reduce((sum, r) => sum + r.helpfulCount, 0);

        // Get tools' total views
        const userTools = await Tool.find({ createdBy: userId });
        const totalViews = userTools.reduce((sum, t) => sum + t.viewCount, 0);

        return res.status(200).json({
            success: true,
            message: 'User statistics retrieved',
            data: {
                stats: {
                    reviewsCount,
                    toolsCount,
                    favoritesCount,
                    averageRating: parseFloat(averageRating),
                    totalHelpful,
                    totalViews,
                    memberSince: user.createdAt
                }
            }
        });

    } catch (error) {
        console.error('Get stats error:', error);

        return res.status(500).json({
            success: false,
            message: 'Error fetching statistics',
            error: error.message
        });
    }
};

// ============================================
// CHANGE PASSWORD
// ============================================

exports.changePassword = async (req, res) => {
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

        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'New password and confirm password do not match'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        const user = await User.findById(userId).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check current password
        const isPasswordMatch = await user.comparePassword(currentPassword);

        if (!isPasswordMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);

        return res.status(500).json({
            success: false,
            message: 'Error changing password',
            error: error.message
        });
    }
};

// ============================================
// DELETE USER ACCOUNT
// ============================================

exports.deleteAccount = async (req, res) => {
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

        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide password for confirmation'
            });
        }

        const user = await User.findById(userId).select('+password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify password
        const isPasswordMatch = await user.comparePassword(password);

        if (!isPasswordMatch) {
            return res.status(400).json({
                success: false,
                message: 'Password is incorrect'
            });
        }

        // Delete user reviews
        await Review.deleteMany({ user: userId });

        // Update tools (remove user as creator)
        await Tool.updateMany(
            { createdBy: userId },
            { $unset: { createdBy: 1 } }
        );

        // Delete user
        await User.findByIdAndDelete(userId);

        return res.status(200).json({
            success: true,
            message: 'Account deleted successfully'
        });

    } catch (error) {
        console.error('Delete account error:', error);

        return res.status(500).json({
            success: false,
            message: 'Error deleting account',
            error: error.message
        });
    }
};

// ============================================
// SEARCH USERS
// ============================================

exports.searchUsers = async (req, res) => {
    try {
        const { query } = req.params;
        const { limit = 10 } = req.query;

        if (!query || query.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search query must be at least 2 characters'
            });
        }

        const users = await User.find(
            { name: { $regex: query, $options: 'i' }, isActive: true },
            'name profilePhoto bio'
        ).limit(parseInt(limit));

        return res.status(200).json({
            success: true,
            message: 'Users found',
            data: {
                users: users.map(user => ({
                    _id: user._id,
                    name: user.name,
                    profilePhoto: user.profilePhoto,
                    bio: user.bio
                })),
                count: users.length
            }
        });

    } catch (error) {
        console.error('Search users error:', error);

        return res.status(500).json({
            success: false,
            message: 'Error searching users',
            error: error.message
        });
    }
};

// ============================================
// GET TOP REVIEWERS (LEADERBOARD)
// ============================================

exports.getTopReviewers = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const topReviewers = await Review.aggregate([
            { $group: { _id: '$user', reviewCount: { $sum: 1 } } },
            { $sort: { reviewCount: -1 } },
            { $limit: parseInt(limit) },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' }
        ]);

        return res.status(200).json({
            success: true,
            message: 'Top reviewers retrieved',
            data: {
                users: topReviewers.map(item => ({
                    _id: item._id,
                    name: item.user.name,
                    profilePhoto: item.user.profilePhoto,
                    reviewCount: item.reviewCount
                }))
            }
        });

    } catch (error) {
        console.error('Get leaderboard error:', error);

        return res.status(500).json({
            success: false,
            message: 'Error fetching leaderboard',
            error: error.message
        });
    }
};

// ============================================
// GET ALL USERS (Admin)
// ============================================

exports.getAllUsers = async (req, res) => {
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
                message: 'Only admins can view all users'
            });
        }

        const { page = 1, limit = 10, role } = req.query;

        let filter = {};
        if (role) {
            filter.role = role;
        }

        const totalUsers = await User.countDocuments(filter);

        const skip = (page - 1) * limit;

        const users = await User.find(filter)
            .select('-password')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: 'Users retrieved',
            data: {
                users: users.map(u => ({
                    _id: u._id,
                    name: u.name,
                    email: u.email,
                    role: u.role,
                    isVerified: u.isVerified,
                    createdAt: u.createdAt
                })),
                pagination: {
                    totalUsers,
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalUsers / limit),
                    limit: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Get all users error:', error);

        return res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
};

// ============================================
// UPDATE USER ROLE (Admin)
// ============================================

exports.updateUserRole = async (req, res) => {
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
        const adminId = decoded.userId;

        // Check if user is admin
        const admin = await User.findById(adminId);
        if (admin.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admins can update user roles'
            });
        }

        const { userId } = req.params;
        const { role } = req.body;

        const validRoles = ['user', 'moderator', 'admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role'
            });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { role },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'User role updated',
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            }
        });

    } catch (error) {
        console.error('Update user role error:', error);

        return res.status(500).json({
            success: false,
            message: 'Error updating user role',
            error: error.message
        });
    }
};

// ============================================
// VERIFY USER EMAIL (Admin)
// ============================================

exports.verifyUserEmail = async (req, res) => {
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
        const adminId = decoded.userId;

        // Check if user is admin
        const admin = await User.findById(adminId);
        if (admin.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admins can verify users'
            });
        }

        const { userId } = req.params;

        const user = await User.findByIdAndUpdate(
            userId,
            { isVerified: true },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'User email verified',
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    isVerified: user.isVerified
                }
            }
        });

    } catch (error) {
        console.error('Verify user error:', error);

        return res.status(500).json({
            success: false,
            message: 'Error verifying user',
            error: error.message
        });
    }
};

// ============================================
// EXPORTS
// ============================================

module.exports = exports;