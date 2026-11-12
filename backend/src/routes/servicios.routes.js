const express = require('express');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const servicioController = require('../controllers/servicio.controller');
const tecnicoController = require('../controllers/tecnico.controller');

const router = express.Router();

router.get('/', servicioController.getAll);
router.get('/:id/tecnicos', authenticate, authorize('ADMINISTRADOR'), tecnicoController.getTecnicosPorServicio);

module.exports = router;