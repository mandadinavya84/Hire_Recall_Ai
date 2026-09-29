const express = require('express');
const router = express.Router();
const seedController = require('../controllers/seedController');

// Open endpoint for 1-click hackathon reset
router.post('/reset', seedController.resetData);

module.exports = router;
