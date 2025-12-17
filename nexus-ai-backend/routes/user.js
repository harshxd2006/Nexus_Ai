const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Routes using controller
router.get('/leaderboard/top-reviewers', userController.getTopReviewers);
router.get('/search/:query', userController.searchUsers);
router.get('/me/profile', userController.getUserProfile);
router.put('/me/profile', userController.updateUserProfile);
router.put('/me/password', userController.changePassword);
router.delete('/me/account', userController.deleteAccount);
router.get('/favorites', userController.getUserFavorites);
router.get('/reviews', userController.getUserReviews);
router.get('/my-tools', userController.getUserTools);
router.get('/stats', userController.getUserStats);
router.get('/:userId/profile', userController.getUserById);
router.get('/:userId/favorites', userController.getUserFavorites);
router.get('/:userId/reviews', userController.getUserReviews);
router.get('/:userId/tools', userController.getUserTools);
router.get('/:userId/stats', userController.getUserStats);

// Admin routes
router.get('/admin/all', userController.getAllUsers);
router.put('/admin/:userId/role', userController.updateUserRole);
router.post('/admin/:userId/verify', userController.verifyUserEmail);

module.exports = router;