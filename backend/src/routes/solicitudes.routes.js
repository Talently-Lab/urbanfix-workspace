const express = require('express');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const notImplemented = require('../middleware/notImplemented');
const solicitudController = require('../controllers/solicitud.controller');

const router = express.Router();

router.use(authenticate);

// Rutas fijas primero (tienen que ir antes que /:id)
router.get('/', authorize('TECNICO'), solicitudController.getDisponibles);
router.post('/', authorize('CLIENTE'), solicitudController.create);
router.get('/mias', authorize('CLIENTE'), solicitudController.getMias);
router.get('/asignadas', authorize('TECNICO'), solicitudController.getAsignadas);

// Rutas con :id
router.get('/:id', notImplemented);
router.get('/:id/eventos', notImplemented);
router.patch('/:id/aceptar', authorize('TECNICO'), solicitudController.aceptar);
router.patch('/:id/rechazar', authorize('TECNICO'), solicitudController.rechazar);
router.patch('/:id/iniciar', authorize('TECNICO'), notImplemented);
router.patch('/:id/completar', authorize('TECNICO'), notImplemented);
router.patch('/:id/cancelar', authorize('CLIENTE', 'TECNICO'), notImplemented);

module.exports = router;