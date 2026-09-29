const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', roleController.listRoles);
router.get('/:id', roleController.getRoleById);
router.post('/', roleController.createRole);

module.exports = router;
