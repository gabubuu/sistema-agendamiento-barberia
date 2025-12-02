require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool } = require('./config/db');

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const configuracionRoutes = require('./routes/configuracion.routes');
const serviciosRoutes = require('./routes/servicios.routes');
const citasRoutes = require('./routes/citas.routes');

const app = express();

// Middleware
app.use(cors()); 
app.use(express.json()); 

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const client = await pool.connect();
    client.release();
    res.status(200).json({ 
      status: 'ok', 
      message: 'API de Barbería funcionando correctamente',
      database: 'Conectado a PostgreSQL'
    });
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'No se pudo conectar a la base de datos.' 
    });
  }
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/configuracion', configuracionRoutes);
app.use('/api/servicios', serviciosRoutes);
app.use('/api/citas', citasRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    mensaje: 'API REST - Sistema de Agendamiento de Barbería',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      configuracion: '/api/configuracion/horario',
      servicios: '/api/servicios',
      citas: '/api/citas'
    }
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint no encontrado',
    ruta: req.originalUrl 
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    mensaje: err.message 
  });
});

const PORT = process.env.PORT || 3001;

// Ejecutar migraciones al iniciar
const { runMigration } = require('./scripts/run-migration');

app.listen(PORT, async () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`📚 Documentación: http://localhost:${PORT}/`);
  
  // Ejecutar migración
  try {
    await runMigration();
  } catch (error) {
    console.error('⚠️  Advertencia: No se pudo ejecutar la migración');
  }
});