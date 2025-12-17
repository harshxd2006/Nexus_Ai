// ============================================
// REVIEW ROUTES
// Review management and ratings
// ============================================

const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// ============================================
// MIDDLEWARE: Get Review by ID
// ============================================
// Note: If your controller handles review fetching internally,
// you can remove this middleware. Otherwise, keep it.

const Review = require('../models/Review');

router.param('reviewId', async (req, res, next, id) => {
    try {
        const review = await Review.findById(id)
            .populate('user', 'name email profilePhoto')
            .populate('tool', 'name slug logo');

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        req.review = review;
        next();

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error fetching review',
            error: error.message
        });
    }
});

// ============================================
// ROUTES
// ============================================

// Create review
router.post('/', reviewController.createReview);

// Get all reviews
router.get('/', reviewController.getReviews);

// Get featured reviews (must be before /:reviewId to avoid route conflict)
router.get('/featured/list', reviewController.getFeaturedReviews);

// Get single review
router.get('/:reviewId', reviewController.getReviewById);

// Update review
router.put('/:reviewId', reviewController.updateReview);

// Delete review
router.delete('/:reviewId', reviewController.deleteReview);

// Mark review as helpful
router.post('/:reviewId/helpful', reviewController.markHelpful);

// Remove helpful vote
router.delete('/:reviewId/helpful', reviewController.removeHelpful);

// Mark review as unhelpful
router.post('/:reviewId/unhelpful', reviewController.markUnhelpful);

// Remove unhelpful vote
router.delete('/:reviewId/unhelpful', reviewController.removeUnhelpful);

// Flag review
router.post('/:reviewId/flag', reviewController.flagReview);

// Approve review (Admin only)
router.post('/:reviewId/approve', reviewController.approveReview);

// Reject review (Admin only)
router.post('/:reviewId/reject', reviewController.rejectReview);

// Feature review (Admin only)
router.post('/:reviewId/feature', reviewController.featureReview);

// Unfeature review (Admin only)
router.delete('/:reviewId/feature', reviewController.unfeatureReview);

// ============================================
// EXPORTS
// ============================================

module.exports = router;