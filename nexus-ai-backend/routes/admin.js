const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Dashboard & Analytics
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/analytics/overview', adminController.getAnalytics);
router.get('/reports/moderation', adminController.getModerationReport);

// User Management
router.get('/users', adminController.getAllUsers);
router.post('/users/:userId/ban', adminController.banUser);
router.post('/users/:userId/unban', adminController.unbanUser);
router.post('/users/:userId/verify', adminController.verifyUser);

// Tool Management
router.get('/tools', adminController.getAllTools);
router.post('/tools/:toolId/approve', adminController.approveTool);
router.post('/tools/:toolId/reject', adminController.rejectTool);
router.post('/tools/:toolId/feature', adminController.featureTool);
router.post('/tools/:toolId/unfeature', adminController.unfeatureTool);
router.delete('/tools/:toolId', adminController.deleteTool);

// Review Moderation
router.get('/reviews/flagged', adminController.getFlaggedReviews);
router.get('/reviews/unapproved', adminController.getUnapprovedReviews);
router.delete('/reviews/:reviewId', adminController.deleteReview);

module.exports = router;