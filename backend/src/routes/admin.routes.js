const express = require('express');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const notImplemented = require('../middleware/notImplemented');
const adminController = require('../controllers/admin.controller');



const router = express.Router();

router.use(authenticate, authorize('ADMINISTRADOR'));

router.get('/usuarios', adminController.getUsuarios);
router.get('/solicitudes', adminController.getSolicitudes);
router.post('/servicios', notImplemented);
router.patch('/servicios/:id', notImplemented);
router.delete('/servicios/:id', notImplemented);

module.exports = router;