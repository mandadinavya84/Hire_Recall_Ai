const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidateController');
const interviewController = require('../controllers/interviewController');
const memoryController = require('../controllers/memoryController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// Candidate CRUD
router.get('/', candidateController.listCandidates);
router.post('/', candidateController.createCandidate);
router.post('/upload-resume', candidateController.uploadResume);
router.get('/:id', candidateController.getCandidateById);
router.put('/:id', candidateController.updateCandidate);

// Sub-resources for Candidate
router.get('/:id/interviews', interviewController.getInterviews);
router.post('/:id/interviews', interviewController.addInterview);
router.get('/:id/memory', memoryController.getCandidateMemories);
router.post('/:id/memory/recall', memoryController.recallCandidateMemory);
router.get('/:id/evolution', memoryController.reflectCandidate);

module.exports = router;
