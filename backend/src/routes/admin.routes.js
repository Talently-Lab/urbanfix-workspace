const express = require('express');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const notImplemented = require('../middleware/notImplemented');

const router = express.Router();

router.use(authenticate, authorize('ADMINISTRADOR'));

router.get('/usuarios', notImplemented);
router.get('/solicitudes', notImplemented);
router.post('/servicios', notImplemented);
router.patch('/servicios/:id', notImplemented);
router.delete('/servicios/:id', notImplemented);

module.exports = router;