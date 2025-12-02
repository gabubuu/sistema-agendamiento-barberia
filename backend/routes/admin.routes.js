const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verificarToken, verificarAdmin } = require('../middleware/auth.middleware');

// Todas las rutas requieren autenticación y rol de admin
router.use(verificarToken);
router.use(verificarAdmin);

// Configuración de horarios
router.get('/configuracion', adminController.obtenerConfiguracion);
router.put('/configuracion', adminController.actualizarConfiguracion);

// Estadísticas
router.get('/estadisticas', adminController.obtenerEstadisticas);

// Gestión de citas
router.get('/citas', adminController.obtenerTodasCitas);
router.delete('/citas/:id', adminController.eliminarCita);
router.delete('/citas-canceladas/limpiar/todas', adminController.limpiarCitasCanceladas);

// Gestión de usuarios
router.get('/usuarios', adminController.obtenerTodosLosUsuarios);

module.exports = router;
