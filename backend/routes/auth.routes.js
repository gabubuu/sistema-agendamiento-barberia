const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verificarToken } = require('../middleware/auth.middleware');

// Rutas públicas
router.post('/register', authController.registrarUsuario);
router.post('/login', authController.loginUsuario);

// Rutas protegidas
router.get('/me', verificarToken, authController.obtenerUsuarioActual);
router.put('/perfil', verificarToken, authController.actualizarPerfil);

module.exports = router;
