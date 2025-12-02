const express = require('express');
const router = express.Router();
const serviciosController = require('../controllers/servicios.controller');
const { verificarToken, verificarAdmin } = require('../middleware/auth.middleware');

// GET /api/servicios - Obtener todos los servicios activos (público)
router.get('/', serviciosController.obtenerServicios);

// POST /api/servicios - Crear un nuevo servicio (solo admin)
router.post('/', verificarToken, verificarAdmin, serviciosController.crearServicio);

// PUT /api/servicios/:id - Actualizar un servicio (solo admin)
router.put('/:id', verificarToken, verificarAdmin, serviciosController.actualizarServicio);

// DELETE /api/servicios/:id - Eliminar un servicio (solo admin)
router.delete('/:id', verificarToken, verificarAdmin, serviciosController.eliminarServicio);

module.exports = router;
