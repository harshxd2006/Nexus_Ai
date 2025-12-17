// ============================================
// ADMIN CONTROLLER - COMPLETE VERSION
// ============================================

const User = require('../models/User');
const Tool = require('../models/Tool');
const Review = require('../models/Review');

// ============================================
// CHECK ADMIN ACCESS
// ============================================
const checkAdminAccess = async (userId) => {
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
        return false;
    }
    return true;
};

// ============================================
// DASHBOARD & ANALYTICS
// ============================================

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
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

        const isAdmin = await checkAdminAccess(userId);
        if (!isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const totalUsers = await User.countDocuments();
        const totalTools = await Tool.countDocuments();
        const totalReviews = await Review.countDocuments();
        const totalFlags = await Review.countDocuments({ isFlagged: true });

        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name email createdAt');

        const recentTools = await Tool.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name category createdAt');

        const recentReviews = await Review.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name')
            .populate('tool', 'name');

        const verifiedUsers = await User.countDocuments({ isVerified: true });
        const unverifiedUsers = totalUsers - verifiedUsers;
        const pendingReviews = await Review.countDocuments({ isApproved: false });

        const toolsByCategory = await Tool.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        return res.status(200).json({
            success: true,
            message: 'Dashboard statistics retrieved',
            data: {
                stats: {
                    totalUsers,
                    totalTools,
                    totalReviews,
                    totalFlags,
                    verifiedUsers,
                    unverifiedUsers,
                    pendingReviews
                },
                recentData: {
                    recentUsers,
                    recentTools,
                    recentReviews
                },
                toolsByCategory
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics',
            error: error.message
        });
    }
};

// Get analytics overview
const getAnalytics = async (req, res) => {
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

        const isAdmin = await checkAdminAccess(userId);
        if (!isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const totalUsers = await User.countDocuments();
        const totalTools = await Tool.countDocuments();
        const totalReviews = await Review.countDocuments();

        const thisMonth = new Date();
        thisMonth.setDate(1);
        const usersThisMonth = await User.countDocuments({
            createdAt: { $gte: thisMonth }
        });

        const toolsThisMonth = await Tool.countDocuments({
            createdAt: { $gte: thisMonth }
        });

        const reviewsThisMonth = await Review.countDocuments({
            createdAt: { $gte: thisMonth }
        });

        const toolsWithRatings = await Tool.aggregate([
            { $group: { _id: null, avgRating: { $avg: '$averageRating' } } }
        ]);
        const avgToolRating = toolsWithRatings[0]?.avgRating || 0;

        const topCategories = await Tool.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        const topRatedTools = await Tool.find()
            .sort({ averageRating: -1 })
            .limit(5)
            .select('name averageRating totalReviews');

        const activeUsers = await User.find()
            .sort({ updatedAt: -1 })
            .limit(5)
            .select('name email updatedAt');

        return res.status(200).json({
            success: true,
            message: 'Analytics retrieved',
            data: {
                overview: {
                    totalUsers,
                    totalTools,
                    totalReviews,
                    usersThisMonth,
                    toolsThisMonth,
                    reviewsThisMonth,
                    avgToolRating: parseFloat(avgToolRating.toFixed(2))
                },
                topData: {
                    topCategories,
                    topRatedTools,
                    activeUsers
                }
            }
        });
    } catch (error) {
        console.error('Get analytics error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching analytics',
            error: error.message
        });
    }
};

// Get moderation report
const getModerationReport = async (req, res) => {
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

        const isAdmin = await checkAdminAccess(userId);
        if (!isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const [flaggedReviews, pendingTools, bannedUsers, suspendedUsers] = await Promise.all([
            Review.countDocuments({ isFlagged: true }),
            Tool.countDocuments({ status: 'pending' }),
            User.countDocuments({ isBanned: true }),
            User.countDocuments({ isSuspended: true })
        ]);

        return res.status(200).json({
            success: true,
            message: 'Moderation report retrieved',
            data: {
                flaggedReviews,
                pendingTools,
                bannedUsers,
                suspendedUsers
            }
        });
    } catch (error) {
        console.error('Get moderation report error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching moderation report',
            error: error.message
        });
    }
};

// ============================================
// USER MANAGEMENT
// ============================================

// Get all users
const getAllUsers = async (req, res) => {
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

        const isAdmin = await checkAdminAccess(userId);
        if (!isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: 'Users retrieved',
            count: users.length,
            data: users
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

// Ban user
const banUser = async (req, res) => {
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

        const isAdmin = await checkAdminAccess(userId);
        if (!isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { isBanned: true },
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
            message: 'User banned successfully',
            data: user
        });
    } catch (error) {
        console.error('Ban user error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error banning user',
            error: error.message
        });
    }
};

// Unban user
const unbanUser = async (req, res) => {
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

        const isAdmin = await checkAdminAccess(userId);
        if (!isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { isBanned: false },
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
            message: 'User unbanned successfully',
            data: user
        });
    } catch (error) {
        console.error('Unban user error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error unbanning user',
            error: error.message
        });
    }
};

// Verify user
const verifyUser = async (req, res) => {
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

        const isAdmin = await checkAdminAccess(userId);
        if (!isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.userId,
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
            message: 'User verified successfully',
            data: user
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
// TOOL MANAGEMENT
// ============================================

// Get all tools
const getAllTools = async (req, res) => {
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

        const isAdmin = await checkAdminAccess(userId);
        if (!isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const tools = await Tool.find()
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: 'Tools retrieved',
            count: tools.length,
            data: tools
        });
    } catch (error) {
        console.error('Get all tools error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching tools',
            error: error.message
        });
    }
};

// Approve tool
const approveTool = async (req, res) => {
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

        const isAdmin = await checkAdminAccess(userId);
        if (!isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const tool = await Tool.findByIdAndUpdate(
            req.params.toolId,
            { status: 'approved', isActive: true },
            { new: true }
        );

        if (!tool) {
            return res.status(404).json({
                success: false,
                message: 'Tool not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Tool approved successfully',
            data: tool
        });
    } catch (error) {
        console.error('Approve tool error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error approving tool',
            error: error.message
        });
    }
};

// Reject tool
const rejectTool = async (req, res) => {
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

        const isAdmin = await checkAdminAccess(userId);
        if (!isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const tool = await Tool.findByIdAndUpdate(
            req.params.toolId,
            { status: 'rejected', isActive: false },
            { new: true }
        );

        if (!tool) {
            return res.status(404).json({
                success: false,
                message: 'Tool not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Tool rejected successfully',
            data: tool
        });
    } catch (error) {
        console.error('Reject tool error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error rejecting tool',
            error: error.message
        });
    }
};

// Feature tool
const featureTool = async (req, res) => {
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

        const isAdmin = await checkAdminAccess(userId);
        if (!isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const tool = await Tool.findByIdAndUpdate(
            req.params.toolId,
            { isFeatured: true },
            { new: true }
        );

        if (!tool) {
            return res.status(404).json({
                success: false,
                message: 'Tool not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Tool featured successfully',
            data: tool
        });
    } catch (error) {
        console.error('Feature tool error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error featuring tool',
            error: error.message
        });
    }
};

// Unfeature tool
const unfeatureTool = async (req, res) => {
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

        const isAdmin = await checkAdminAccess(userId);
        if (!isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const tool = await Tool.findByIdAndUpdate(
            req.params.toolId,
            { isFeatured: false },
            { new: true }
        );

        if (!tool) {
            return res.status(404).json({
                success: false,
                message: 'Tool not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Tool unfeatured successfully',
            data: tool
        });
    } catch (error) {
        console.error('Unfeature tool error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error unfeaturing tool',
            error: error.message
        });
    }
};

// Delete tool
const deleteTool = async (req, res) => {
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

        const isAdmin = await checkAdminAccess(userId);
        if (!isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const tool = await Tool.findByIdAndDelete(req.params.toolId);

        if (!tool) {
            return res.status(404).json({
                success: false,
                message: 'Tool not found'
            });
        }

        await Review.deleteMany({ tool: req.params.toolId });

        return res.status(200).json({
            success: true,
            message: 'Tool and associated reviews deleted successfully'
        });
    } catch (error) {
        console.error('Delete tool error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error deleting tool',
            error: error.message
        });
    }
};

// ============================================
// REVIEW MODERATION
// ============================================

// Get flagged reviews
const getFlaggedReviews = async (req, res) => {
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

        const isAdmin = await checkAdminAccess(userId);
        if (!isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const reviews = await Review.find({ isFlagged: true })
            .populate('user', 'name email')
            .populate('tool', 'name')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: 'Flagged reviews retrieved',
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        console.error('Get flagged reviews error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching flagged reviews',
            error: error.message
        });
    }
};

// Get unapproved reviews
const getUnapprovedReviews = async (req, res) => {
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

        const isAdmin = await checkAdminAccess(userId);
        if (!isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const reviews = await Review.find({ isApproved: false })
            .populate('user', 'name email')
            .populate('tool', 'name')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: 'Unapproved reviews retrieved',
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        console.error('Get unapproved reviews error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching unapproved reviews',
            error: error.message
        });
    }
};

// Delete review
const deleteReview = async (req, res) => {
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

        const isAdmin = await checkAdminAccess(userId);
        if (!isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const review = await Review.findByIdAndDelete(req.params.reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        const tool = await Tool.findById(review.tool);
        if (tool) {
            const reviews = await Review.find({ tool: review.tool });
            const avgRating = reviews.length > 0
                ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                : 0;

            tool.averageRating = avgRating;
            tool.totalReviews = reviews.length;
            await tool.save();
        }

        return res.status(200).json({
            success: true,
            message: 'Review deleted successfully'
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
// EXPORTS - ALL FUNCTIONS
// ============================================
module.exports = {
    getDashboardStats,
    getAnalytics,
    getModerationReport,
    getAllUsers,
    banUser,
    unbanUser,
    verifyUser,
    getAllTools,
    approveTool,
    rejectTool,
    featureTool,
    unfeatureTool,
    deleteTool,
    getFlaggedReviews,
    getUnapprovedReviews,
    deleteReview
};