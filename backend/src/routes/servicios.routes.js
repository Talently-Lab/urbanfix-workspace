const express = require('express');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const notImplemented = require('../middleware/notImplemented');
const servicioController = require('../controllers/servicio.controller');
const tecnicoController = require('../controllers/tecnico.controller');

const router = express.Router();

router.use(authenticate);

router.get('/', servicioController.getAll);
router.get('/:id/tecnicos', authorize('ADMINISTRADOR'), tecnicoController.getTecnicosPorServicio);

module.exports = router;