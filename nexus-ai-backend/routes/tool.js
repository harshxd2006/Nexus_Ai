const express = require('express');
const router = express.Router();
const toolController = require('../controllers/toolController');

router.post('/', toolController.createTool);
router.get('/', toolController.getTools);
router.get('/:toolId', toolController.getToolById);
router.put('/:toolId', toolController.updateTool);
router.delete('/:toolId', toolController.deleteTool);
router.post('/:toolId/favorite', toolController.addToFavorites);
router.delete('/:toolId/favorite', toolController.removeFromFavorites);
router.post('/:toolId/upvote', toolController.upvoteTool);
router.get('/search/:query', toolController.searchTools);
router.get('/category/:category', toolController.getToolsByCategory);
router.get('/:toolId/stats', toolController.getToolStats);
router.get('/trending/popular', toolController.getTrendingTools);
router.get('/featured/list', toolController.getFeaturedTools);

module.exports = router;
