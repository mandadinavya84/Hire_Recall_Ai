const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Hero feature: Prepare Next Interview
router.post('/prepare-interview', aiController.prepareNextInterview);

// AI Chatbot grounded in candidate memory
router.post('/chat', aiController.askCandidateQuestion);

// Before vs After Memory demonstration
router.get('/before-after/:candidateId', aiController.getBeforeAfterComparison);

module.exports = router;
