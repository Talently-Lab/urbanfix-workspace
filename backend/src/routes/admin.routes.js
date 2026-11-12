const express = require('express');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const notImplemented = require('../middleware/notImplemented');
const adminController = require('../controllers/admin.controller');

const router = express.Router();

router.use(authenticate, authorize('ADMINISTRADOR'));

router.get('/usuarios', adminController.getUsuarios);
router.get('/solicitudes', adminController.getSolicitudes);
router.patch('/solicitudes/:id/cancelar', adminController.cancelarSolicitud);

router.get('/metricas', adminController.getMetricas);

router.post('/servicios', adminController.crearServicio);
router.patch('/servicios/:id', notImplemented);
router.delete('/servicios/:id', notImplemented);

module.exports = router;
