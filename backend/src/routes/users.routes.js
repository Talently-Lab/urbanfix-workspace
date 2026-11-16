const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const userController = require('../controllers/user.controller');

const router = express.Router();

router.get('/me', authenticate, userController.getMe);
router.patch('/me', authenticate, userController.updateMe);

module.exports = router;