const express = require('express');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const notImplemented = require('../middleware/notImplemented');

const router = express.Router();

router.use(authenticate);

// Rutas fijas primero (tienen que ir antes que /:id)
router.get('/', authorize('TECNICO'), notImplemented);
router.post('/', authorize('CLIENTE'), notImplemented);
router.get('/mias', authorize('CLIENTE'), notImplemented);
router.get('/asignadas', authorize('TECNICO'), notImplemented);

// Rutas con :id
router.get('/:id', notImplemented);
router.get('/:id/eventos', notImplemented);
router.patch('/:id/aceptar', authorize('TECNICO'), notImplemented);
router.patch('/:id/rechazar', authorize('TECNICO'), notImplemented);
router.patch('/:id/iniciar', authorize('TECNICO'), notImplemented);
router.patch('/:id/completar', authorize('TECNICO'), notImplemented);
router.patch('/:id/cancelar', authorize('CLIENTE', 'TECNICO'), notImplemented);

module.exports = router;