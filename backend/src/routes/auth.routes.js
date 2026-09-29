const express = require('express');
const { register } = require('../controllers/auth.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/register', register);

router.get('/test', authenticate, authorize('CLIENTE'), (req, res) => {
  res.json({
    message: 'Ruta protegida OK',
    usuario: req.user
  });
});

module.exports = router;