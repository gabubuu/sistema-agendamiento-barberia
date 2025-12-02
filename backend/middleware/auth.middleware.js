const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secreto-super-seguro-cambialo-en-produccion';

/**
 * Middleware para verificar token JWT
 */
const verificarToken = (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Token no proporcionado'
      });
    }

    const token = authHeader.substring(7); // Remover "Bearer "

    // Verificar token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Agregar información del usuario al request
    req.usuario = {
      id: decoded.id,
      email: decoded.email,
      rol: decoded.rol
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token inválido'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado'
      });
    }

    console.error('Error en middleware de autenticación:', error);
    return res.status(500).json({
      error: 'Error al verificar token'
    });
  }
};

/**
 * Middleware para verificar rol de administrador
 */
const verificarAdmin = (req, res, next) => {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({
      error: 'Acceso denegado. Se requiere rol de administrador'
    });
  }
  next();
};

module.exports = {
  verificarToken,
  verificarAdmin
};
