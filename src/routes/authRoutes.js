const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

router.post('/login', authController.login);
router.post('/demo-login', authController.demoLogin);
router.get('/me', authMiddleware, authController.getMe);
router.put('/preferences', authMiddleware, authController.updatePreferences);

module.exports = router;
