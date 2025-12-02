const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secreto-super-seguro-cambialo-en-produccion';
const JWT_EXPIRATION = '7d'; // Token válido por 7 días

/**
 * Registrar nuevo usuario
 * POST /api/auth/register
 */
const registrarUsuario = async (req, res) => {
  try {
    const { nombre, email, password, telefono } = req.body;

    // Validaciones básicas
    if (!nombre || !email || !password) {
      return res.status(400).json({
        error: 'Nombre, email y contraseña son obligatorios'
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Formato de email inválido'
      });
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return res.status(400).json({
        error: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Verificar si el email ya existe
    const usuarioExistente = await db.query(
      'SELECT id FROM usuarios WHERE email = $1',
      [email.toLowerCase()]
    );

    if (usuarioExistente.rows.length > 0) {
      return res.status(400).json({
        error: 'El email ya está registrado'
      });
    }

    // Hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insertar usuario
    const query = `
      INSERT INTO usuarios (nombre, email, password_hash, telefono, rol)
      VALUES ($1, $2, $3, $4, 'cliente')
      RETURNING id, nombre, email, telefono, rol, creado_en
    `;

    const result = await db.query(query, [
      nombre,
      email.toLowerCase(),
      passwordHash,
      telefono || null
    ]);

    const usuario = result.rows[0];

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: usuario.id, 
        email: usuario.email, 
        rol: usuario.rol 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: usuario.telefono,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({
      error: 'Error al registrar usuario',
      detalle: error.message
    });
  }
};

/**
 * Login de usuario
 * POST /api/auth/login
 */
const loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email y contraseña son obligatorios'
      });
    }

    // Buscar usuario por email
    const query = `
      SELECT id, nombre, email, password_hash, telefono, rol, activo
      FROM usuarios
      WHERE email = $1
    `;

    const result = await db.query(query, [email.toLowerCase()]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Credenciales inválidas'
      });
    }

    const usuario = result.rows[0];

    // Verificar si el usuario está activo
    if (!usuario.activo) {
      return res.status(401).json({
        error: 'Usuario desactivado'
      });
    }

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password_hash);

    if (!passwordValida) {
      return res.status(401).json({
        error: 'Credenciales inválidas'
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: usuario.id, 
        email: usuario.email, 
        rol: usuario.rol 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    res.status(200).json({
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        telefono: usuario.telefono,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error('Error al hacer login:', error);
    res.status(500).json({
      error: 'Error al hacer login',
      detalle: error.message
    });
  }
};

/**
 * Obtener información del usuario autenticado
 * GET /api/auth/me
 */
const obtenerUsuarioActual = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const query = `
      SELECT id, nombre, email, telefono, rol, creado_en
      FROM usuarios
      WHERE id = $1 AND activo = true
    `;

    const result = await db.query(query, [usuarioId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      usuario: result.rows[0]
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      error: 'Error al obtener usuario',
      detalle: error.message
    });
  }
};

/**
 * Actualizar perfil del usuario autenticado
 * PUT /api/auth/perfil
 */
const actualizarPerfil = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const { nombre, telefono } = req.body;

    // Validaciones
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({
        error: 'El nombre es obligatorio'
      });
    }

    // Actualizar usuario
    const query = `
      UPDATE usuarios 
      SET nombre = $1, telefono = $2
      WHERE id = $3 AND activo = true
      RETURNING id, nombre, email, telefono, rol
    `;

    const result = await db.query(query, [
      nombre.trim(),
      telefono || null,
      usuarioId
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      mensaje: 'Perfil actualizado exitosamente',
      usuario: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      error: 'Error al actualizar perfil',
      detalle: error.message
    });
  }
};

module.exports = {
  registrarUsuario,
  loginUsuario,
  obtenerUsuarioActual,
  actualizarPerfil
};
