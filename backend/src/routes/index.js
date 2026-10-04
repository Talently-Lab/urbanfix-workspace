const express = require('express');
const authRoutes = require('./auth.routes');
const serviciosRoutes = require('./servicios.routes');
const tecnicosRoutes = require('./tecnicos.routes');
const solicitudesRoutes = require('./solicitudes.routes');
const adminRoutes = require('./admin.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/servicios', serviciosRoutes);
router.use('/tecnicos', tecnicosRoutes);
router.use('/solicitudes', solicitudesRoutes);
router.use('/admin', adminRoutes);

module.exports = router;