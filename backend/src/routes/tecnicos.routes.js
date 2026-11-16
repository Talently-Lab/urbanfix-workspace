const express = require('express');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const tecnicoController = require('../controllers/tecnico.controller');

const router = express.Router();

router.use(authenticate, authorize('TECNICO'));

router.get('/me/servicios', tecnicoController.getMisServicios);

module.exports = router;