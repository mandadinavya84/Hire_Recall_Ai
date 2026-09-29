const express = require('express');
const router = express.Router();
const memoryController = require('../controllers/memoryController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/metrics', memoryController.getMetrics);
router.get('/stats', memoryController.getMetrics);
router.get('/all', memoryController.getAllMemories);
router.get('/health', memoryController.getHindsightHealth);
router.get('/candidate/:candidateId', memoryController.getCandidateMemories);
router.get('/candidate/:candidateId/memories', memoryController.getCandidateMemories);

module.exports = router;
