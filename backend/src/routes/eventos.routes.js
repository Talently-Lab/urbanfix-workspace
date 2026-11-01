const express = require('express');
const { optionalAuthenticate } = require('../middleware/auth.middleware');
const eventoController = require('../controllers/evento.controller');

const router = express.Router();

router.post('/', optionalAuthenticate, eventoController.crear);

module.exports = router;