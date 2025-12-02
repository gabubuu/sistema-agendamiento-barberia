const express = require('express');
const router = express.Router();
const citasController = require('../controllers/citas.controller');
const { verificarToken } = require('../middleware/auth.middleware');

// POST /api/citas - Crear una nueva cita (CON TODAS LAS VALIDACIONES)
router.post('/', citasController.crearCita);

// GET /api/citas - Obtener citas (todas si es admin, solo las propias si es cliente)
router.get('/', verificarToken, citasController.obtenerCitas);

// GET /api/citas/disponibilidad - Obtener disponibilidad para una fecha
router.get('/disponibilidad', citasController.obtenerDisponibilidad);

// GET /api/citas/:id - Obtener una cita específica
router.get('/:id', verificarToken, citasController.obtenerCitaPorId);

// PATCH /api/citas/:id/cancelar - Cancelar una cita
router.patch('/:id/cancelar', verificarToken, citasController.cancelarCita);

module.exports = router;
