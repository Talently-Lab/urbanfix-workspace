const express = require('express');
const { register, login } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const notImplemented = require('../middleware/notImplemented');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.get('/me', authenticate, notImplemented);
module.exports = router;