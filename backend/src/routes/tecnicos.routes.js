const express = require('express');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const notImplemented = require('../middleware/notImplemented');

const router = express.Router();

router.use(authenticate, authorize('TECNICO'));

router.get('/me/servicios', notImplemented);

module.exports = router;