const express = require('express');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const notImplemented = require('../middleware/notImplemented');

const router = express.Router();

router.use(authenticate);

router.get('/', notImplemented);
router.get('/:id/tecnicos', authorize('ADMINISTRADOR'), notImplemented);

module.exports = router;