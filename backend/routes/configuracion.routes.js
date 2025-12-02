const express = require('express');
const router = express.Router();
const configuracionController = require('../controllers/configuracion.controller');

// POST /api/configuracion/horario - Configurar horario semanal (UPSERT)
router.post('/horario', configuracionController.configurarHorarioSemanal);

// GET /api/configuracion/horario - Obtener horario semanal configurado
router.get('/horario', configuracionController.obtenerHorarioSemanal);

module.exports = router;
