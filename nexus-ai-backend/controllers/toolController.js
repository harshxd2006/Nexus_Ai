// ============================================
// TOOL CONTROLLER
// Tool management business logic
// ============================================

const Tool = require('../models/Tool');
const User = require('../models/User');
const Review = require('../models/Review');

// ============================================
// CREATE TOOL
// ============================================

exports.createTool = async (req, res) => {
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

        const { name, description, website, category, pricing, logo, tags, features } = req.body;

        if (!name || !description || !website || !category || !pricing) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        if (name.length < 3 || name.length > 100) {
            return res.status(400).json({
                success: false,
                message: 'Tool name must be between 3 and 100 characters'
            });
        }

        if (description.length < 10) {
            return res.status(400).json({
                success: false,
                message: 'Description must be at least 10 characters'
            });
        }

        const existingTool = await Tool.findOne({ name });

        if (existingTool) {
            return res.status(400).json({
                success: false,
                message: 'Tool with this name already exists'
            });
        }

        try {
            new URL(website);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Invalid website URL'
            });
        }

        const tool = await Tool.create({
            name,
            description,
            website,
            category,
            pricing,
            logo,
            tags: tags || [],
            features: features || [],
            createdBy: userId
        });

        await tool.populate('createdBy', 'name email profilePhoto');

        return res.status(201).json({
            success: true,
            message: 'Tool created successfully',
            data: {
                tool: tool.getSummary()
            }
        });

    } catch (error) {
        console.error('Create tool error:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages[0]
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Error creating tool',
            error: error.message
        });
    }
};

// ============================================
// GET ALL TOOLS
// ============================================

exports.getTools = async (req, res) => {
    try {
        const { page = 1, limit = 10, category, pricing, sortBy = 'createdAt', order = 'desc', search } = req.query;

        let filter = { isActive: true };

        if (category) {
            filter.category = category;
        }

        if (pricing) {
            filter['pricing.type'] = pricing;
        }

        let query = Tool.find(filter);

        if (search) {
            query = Tool.find({
                ...filter,
                $text: { $search: search }
            });
        }

        const totalTools = await Tool.countDocuments(filter);

        const sortOrder = order === 'asc' ? 1 : -1;
        query = query.sort({ [sortBy]: sortOrder });

        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(parseInt(limit));

        const tools = await query.populate('createdBy', 'name email profilePhoto');

        return res.status(200).json({
            success: true,
            message: 'Tools retrieved successfully',
            data: {
                tools: tools.map(tool => tool.getSummary()),
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
// GET TOOL BY ID
// ============================================

exports.getToolById = async (req, res) => {
    try {
        const { toolId } = req.params;

        const tool = await Tool.findById(toolId)
            .populate('createdBy', 'name email profilePhoto')
            .populate('reviews');

        if (!tool || !tool.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Tool not found'
            });
        }

        await tool.incrementViewCount();

        const fullTool = await tool.getFullTool();

        return res.status(200).json({
            success: true,
            message: 'Tool retrieved successfully',
            data: {
                tool: {
                    _id: fullTool._id,
                    name: fullTool.name,
                    slug: fullTool.slug,
                    description: fullTool.description,
                    website: fullTool.website,
                    logo: fullTool.logo,
                    category: fullTool.category,
                    tags: fullTool.tags,
                    features: fullTool.features,
                    pricing: fullTool.pricing,
                    averageRating: fullTool.averageRating,
                    totalReviews: fullTool.totalReviews,
                    reviews: fullTool.reviews,
                    viewCount: fullTool.viewCount,
                    usageCount: fullTool.usageCount,
                    upvotes: fullTool.upvotes,
                    favoritedCount: fullTool.favoritedBy.length,
                    createdBy: fullTool.createdBy,
                    createdAt: fullTool.createdAt
                }
            }
        });

    } catch (error) {
        console.error('Get tool error:', error);

        return res.status(500).json({
            success: false,
            message: 'Error fetching tool',
            error: error.message
        });
    }
};

// ============================================
// SEARCH TOOLS
// ============================================

exports.searchTools = async (req, res) => {
    try {
        const { query } = req.params;
        const { limit = 10 } = req.query;

        if (!query || query.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'Search query must be at least 2 characters'
            });
        }

        const tools = await Tool.find(
            { $text: { $search: query } },
            { score: { $meta: 'textScore' } }
        )
            .sort({ score: { $meta: 'textScore' } })
            .limit(parseInt(limit))
            .populate('createdBy', 'name email profilePhoto');

        return res.status(200).json({
            success: true,
            message: 'Search results',
            data: {
                tools: tools.map(tool => tool.getSummary()),
                count: tools.length
            }
        });

    } catch (error) {
        console.error('Search error:', error);

        return res.status(500).json({
            success: false,
            message: 'Error searching tools',
            error: error.message
        });
    }
};

// ============================================
// UPDATE TOOL
// ============================================

exports.updateTool = async (req, res) => {
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

        const { toolId } = req.params;
        const { name, description, website, category, pricing, logo, tags, features } = req.body;

        const tool = await Tool.findById(toolId);

        if (!tool) {
            return res.status(404).json({
                success: false,
                message: 'Tool not found'
            });
        }

        if (tool.createdBy.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Only tool creator can update'
            });
        }

        if (name) {
            if (name.length < 3 || name.length > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'Tool name must be between 3 and 100 characters'
                });
            }
            tool.name = name;
        }

        if (description) {
            if (description.length < 10) {
                return res.status(400).json({
                    success: false,
                    message: 'Description must be at least 10 characters'
                });
            }
            tool.description = description;
        }

        if (website) {
            try {
                new URL(website);
                tool.website = website;
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid website URL'
                });
            }
        }

        if (category) tool.category = category;
        if (pricing) tool.pricing = pricing;
        if (logo) tool.logo = logo;
        if (tags) tool.tags = tags;
        if (features) tool.features = features;

        await tool.save();

        return res.status(200).json({
            success: true,
            message: 'Tool updated successfully',
            data: {
                tool: tool.getSummary()
            }
        });

    } catch (error) {
        console.error('Update tool error:', error);

        return res.status(500).json({
            success: false,
            message: 'Error updating tool',
            error: error.message
        });
    }
};

// ============================================
// DELETE TOOL
// ============================================

exports.deleteTool = async (req, res) => {
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

        const { toolId } = req.params;

        const tool = await Tool.findById(toolId);

        if (!tool) {
            return res.status(404).json({
                success: false,
                message: 'Tool not found'
            });
        }

        if (tool.createdBy.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Only tool creator can delete'
            });
        }

        await Review.deleteMany({ tool: toolId });

        await Tool.findByIdAndDelete(toolId);

        return res.status(200).json({
            success: true,
            message: 'Tool deleted successfully',
            data: {
                deletedToolId: toolId
            }
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
// ADD TO FAVORITES
// ============================================

exports.addToFavorites = async (req, res) => {
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

        const { toolId } = req.params;

        const tool = await Tool.findById(toolId);

        if (!tool) {
            return res.status(404).json({
                success: false,
                message: 'Tool not found'
            });
        }

        await tool.addToFavorites(userId);

        const user = await User.findById(userId);
        await user.addFavoriteTool(toolId);

        return res.status(200).json({
            success: true,
            message: 'Tool added to favorites',
            data: {
                toolId: tool._id,
                favoritedCount: tool.favoritedBy.length
            }
        });

    } catch (error) {
        console.error('Add favorite error:', error);

        return res.status(500).json({
            success: false,
            message: 'Error adding to favorites',
            error: error.message
        });
    }
};

// ============================================
// REMOVE FROM FAVORITES
// ============================================

exports.removeFromFavorites = async (req, res) => {
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

        const { toolId } = req.params;

        const tool = await Tool.findById(toolId);

        if (!tool) {
            return res.status(404).json({
                success: false,
                message: 'Tool not found'
            });
        }

        await tool.removeFromFavorites(userId);

        const user = await User.findById(userId);
        await user.removeFavoriteTool(toolId);

        return res.status(200).json({
            success: true,
            message: 'Tool removed from favorites',
            data: {
                toolId: tool._id,
                favoritedCount: tool.favoritedBy.length
            }
        });

    } catch (error) {
        console.error('Remove favorite error:', error);

        return res.status(500).json({
            success: false,
            message: 'Error removing from favorites',
            error: error.message
        });
    }
};

// ============================================
// UPVOTE TOOL
// ============================================

exports.upvoteTool = async (req, res) => {
    try {
        const { toolId } = req.params;

        const tool = await Tool.findById(toolId);

        if (!tool) {
            return res.status(404).json({
                success: false,
                message: 'Tool not found'
            });
        }

        await tool.addUpvote();

        return res.status(200).json({
            success: true,
            message: 'Tool upvoted',
            data: {
                toolId: tool._id,
                upvotes: tool.upvotes
            }
        });

    } catch (error) {
        console.error('Upvote error:', error);

        return res.status(500).json({
            success: false,
            message: 'Error upvoting tool',
            error: error.message
        });
    }
};

// ============================================
// GET TRENDING TOOLS
// ============================================

exports.getTrendingTools = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const trendingTools = await Tool.find({ isActive: true })
            .sort({ averageRating: -1, viewCount: -1, upvotes: -1 })
            .limit(parseInt(limit))
            .populate('createdBy', 'name email profilePhoto');

        return res.status(200).json({
            success: true,
            message: 'Trending tools',
            data: {
                tools: trendingTools.map(tool => tool.getSummary())
            }
        });

    } catch (error) {
        console.error('Trending error:', error);

        return res.status(500).json({
            success: false,
            message: 'Error fetching trending tools',
            error: error.message
        });
    }
};

// ============================================
// GET TOOLS BY CATEGORY
// ============================================

exports.getToolsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const { limit = 10, page = 1 } = req.query;

        const tools = await Tool.find({
            category,
            isActive: true
        })
            .limit(parseInt(limit))
            .skip((page - 1) * limit)
            .populate('createdBy', 'name email profilePhoto');

        const totalTools = await Tool.countDocuments({ category, isActive: true });

        return res.status(200).json({
            success: true,
            message: `Tools in ${category} category`,
            data: {
                tools: tools.map(tool => tool.getSummary()),
                pagination: {
                    totalTools,
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalTools / limit)
                }
            }
        });

    } catch (error) {
        console.error('Category error:', error);

        return res.status(500).json({
            success: false,
            message: 'Error fetching tools by category',
            error: error.message
        });
    }
};

// ============================================
// GET TOOL STATISTICS
// ============================================

exports.getToolStats = async (req, res) => {
    try {
        const { toolId } = req.params;

        const tool = await Tool.findById(toolId);

        if (!tool) {
            return res.status(404).json({
                success: false,
                message: 'Tool not found'
            });
        }

        const reviews = await Review.find({ tool: toolId });
        const ratingDistribution = {};
        
        for (let i = 1; i <= 5; i++) {
            ratingDistribution[i] = reviews.filter(r => r.rating === i).length;
        }

        const stats = {
            viewCount: tool.viewCount,
            usageCount: tool.usageCount,
            upvotes: tool.upvotes,
            favoritesCount: tool.favoritedBy.length,
            reviewsCount: reviews.length,
            averageRating: tool.averageRating,
            ratingDistribution
        };

        return res.status(200).json({
            success: true,
            message: 'Tool statistics retrieved',
            data: {
                stats
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
// GET FEATURED TOOLS
// ============================================

exports.getFeaturedTools = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const featuredTools = await Tool.find({
            isFeatured: true,
            isActive: true
        })
            .limit(parseInt(limit))
            .populate('createdBy', 'name email profilePhoto');

        return res.status(200).json({
            success: true,
            message: 'Featured tools',
            data: {
                tools: featuredTools.map(tool => tool.getSummary())
            }
        });

    } catch (error) {
        console.error('Featured tools error:', error);

        return res.status(500).json({
            success: false,
            message: 'Error fetching featured tools',
            error: error.message
        });
    }
};

// ============================================
// EXPORTS
// ============================================

module.exports = exports;
