const db = require('../config/db');

/**
 * Controlador de gestión de citas
 * Maneja validaciones de horarios y disponibilidad
 */

/**
 * Crear nueva cita
 */
const crearCita = async (req, res) => {
  try {
    const { cliente_nombre, cliente_email, servicio_id, fecha } = req.body;

    // Validar campos requeridos
    if (!cliente_nombre || !servicio_id || !fecha) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: cliente_nombre, servicio_id, fecha'
      });
    }

    // Validar servicio
    const servicioQuery = `
      SELECT id, nombre, duracion_minutos, precio_clp, activo
      FROM servicios
      WHERE id = $1 AND activo = true;
    `;
    const servicioResult = await db.query(servicioQuery, [servicio_id]);

    if (servicioResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Servicio no encontrado o inactivo'
      });
    }

    const servicio = servicioResult.rows[0];

    // Calcular fechas
    const fechaInicio = new Date(fecha);
    
    if (isNaN(fechaInicio.getTime())) {
      return res.status(400).json({
        error: 'Fecha inválida. Use formato ISO 8601 (ej: 2025-11-24T10:00:00)'
      });
    }

    // Calcular hora de fin sumando la duración del servicio
    const fechaFin = new Date(fechaInicio.getTime() + servicio.duracion_minutos * 60000);

    // Validar fecha futura
    const ahora = new Date();
    if (fechaInicio < ahora) {
      return res.status(400).json({
        error: 'No se pueden agendar citas en el pasado'
      });
    }

    // Obtener horario del día
    const diaSemana = fechaInicio.getDay(); // 0=Domingo, 1=Lunes, ..., 6=Sábado

    const horarioQuery = `
      SELECT * FROM horario_semanal
      WHERE dia_semana = $1;
    `;
    const horarioResult = await db.query(horarioQuery, [diaSemana]);

    if (horarioResult.rows.length === 0) {
      return res.status(400).json({
        error: `No hay configuración de horario para el día seleccionado (día ${diaSemana})`
      });
    }

    const horario = horarioResult.rows[0];

    // Verificar día laboral
    if (!horario.es_laboral) {
      return res.status(400).json({
        error: 'La barbería no atiende el día seleccionado'
      });
    }

    // Validar horario de atención
    // Obtener la hora en timezone de Chile usando Intl.DateTimeFormat
    const opcionesHora = { 
      timeZone: 'America/Santiago', 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false 
    };
    
    const horaInicioCita = new Intl.DateTimeFormat('en-GB', opcionesHora).format(fechaInicio);
    const horaFinCita = new Intl.DateTimeFormat('en-GB', opcionesHora).format(fechaFin);
    
    if (horaInicioCita < horario.hora_apertura) {
      return res.status(400).json({
        error: `La cita no puede comenzar antes de la hora de apertura (${horario.hora_apertura})`
      });
    }

    if (horaFinCita > horario.hora_cierre) {
      return res.status(400).json({
        error: `La cita no puede terminar después de la hora de cierre (${horario.hora_cierre})`
      });
    }

    // Validar horario de descanso
    // Por ahora, se permite agendar en cualquier hora dentro del horario laboral

    // Verificar solapamiento de citas
    const solapamientoQuery = `
      SELECT id, cliente_nombre, fecha, hora_fin_calculada
      FROM citas
      WHERE estado = 'confirmada'
        AND (
          -- Caso 1: La nueva cita comienza durante una cita existente
          ($1 >= fecha AND $1 < hora_fin_calculada)
          OR
          -- Caso 2: La nueva cita termina durante una cita existente
          ($2 > fecha AND $2 <= hora_fin_calculada)
          OR
          -- Caso 3: La nueva cita abarca completamente una cita existente
          ($1 <= fecha AND $2 >= hora_fin_calculada)
        );
    `;

    const solapamientoResult = await db.query(solapamientoQuery, [
      fechaInicio,
      fechaFin
    ]);

    if (solapamientoResult.rows.length > 0) {
      const citaExistente = solapamientoResult.rows[0];
      return res.status(409).json({
        error: 'Ya existe una cita confirmada en ese horario',
        cita_existente: {
          cliente: citaExistente.cliente_nombre,
          inicio: citaExistente.fecha,
          fin: citaExistente.hora_fin_calculada
        }
      });
    }

    // Crear la cita
    const insertQuery = `
      INSERT INTO citas (
        cliente_nombre,
        cliente_email,
        servicio_id,
        fecha,
        hora_fin_calculada,
        estado
      )
      VALUES ($1, $2, $3, $4, $5, 'confirmada')
      RETURNING *;
    `;

    const insertValues = [
      cliente_nombre,
      cliente_email || null,
      servicio_id,
      fechaInicio,
      fechaFin
    ];

    const result = await db.query(insertQuery, insertValues);

    // Respuesta exitosa con todos los detalles
    res.status(201).json({
      mensaje: 'Cita agendada exitosamente',
      cita: {
        ...result.rows[0],
        servicio: {
          nombre: servicio.nombre,
          duracion_minutos: servicio.duracion_minutos,
          precio_clp: servicio.precio_clp
        }
      }
    });
  } catch (error) {
    console.error('Error al crear cita:', error);
    res.status(500).json({
      error: 'Error al crear la cita',
      detalle: error.message
    });
  }
};

/**
 * Obtener todas las citas (con filtros opcionales)
 * GET /api/citas?estado=confirmada&fecha_desde=...&fecha_hasta=...
 * Si es cliente, solo devuelve sus propias citas
 * Si es admin, devuelve todas las citas
 */
const obtenerCitas = async (req, res) => {
  try {
    const { estado, fecha_desde, fecha_hasta } = req.query;
    const usuario = req.usuario; // Viene del middleware verificarToken

    let query = `
      SELECT 
        c.id,
        c.cliente_nombre,
        c.cliente_email,
        c.fecha,
        c.hora_fin_calculada,
        c.estado,
        s.nombre as servicio_nombre,
        s.duracion_minutos,
        s.precio_clp
      FROM citas c
      INNER JOIN servicios s ON c.servicio_id = s.id
      WHERE 1=1
    `;

    const values = [];
    let paramCounter = 1;

    // Si el usuario es cliente, solo mostrar sus propias citas
    if (usuario.rol === 'cliente') {
      query += ` AND c.cliente_email = $${paramCounter++}`;
      values.push(usuario.email);
    }

    if (estado) {
      query += ` AND c.estado = $${paramCounter++}`;
      values.push(estado);
    }

    if (fecha_desde) {
      query += ` AND c.fecha >= $${paramCounter++}`;
      values.push(fecha_desde);
    }

    if (fecha_hasta) {
      query += ` AND c.fecha <= $${paramCounter++}`;
      values.push(fecha_hasta);
    }

    query += ' ORDER BY c.fecha ASC';

    const result = await db.query(query, values);

    res.status(200).json({
      total: result.rows.length,
      citas: result.rows
    });
  } catch (error) {
    console.error('Error al obtener citas:', error);
    res.status(500).json({
      error: 'Error al obtener citas',
      detalle: error.message
    });
  }
};

/**
 * Obtener una cita específica por ID
 * GET /api/citas/:id
 */
const obtenerCitaPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        c.*,
        s.nombre as servicio_nombre,
        s.duracion_minutos,
        s.precio_clp
      FROM citas c
      INNER JOIN servicios s ON c.servicio_id = s.id
      WHERE c.id = $1;
    `;

    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Cita no encontrada'
      });
    }

    res.status(200).json({
      cita: result.rows[0]
    });
  } catch (error) {
    console.error('Error al obtener cita:', error);
    res.status(500).json({
      error: 'Error al obtener la cita',
      detalle: error.message
    });
  }
};

/**
 * Cancelar una cita
 * PATCH /api/citas/:id/cancelar
 */
const cancelarCita = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      UPDATE citas
      SET estado = 'cancelada'
      WHERE id = $1 AND estado = 'confirmada'
      RETURNING *;
    `;

    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Cita no encontrada o ya está cancelada'
      });
    }

    res.status(200).json({
      mensaje: 'Cita cancelada exitosamente',
      cita: result.rows[0]
    });
  } catch (error) {
    console.error('Error al cancelar cita:', error);
    res.status(500).json({
      error: 'Error al cancelar la cita',
      detalle: error.message
    });
  }
};

/**
 * Obtener horarios disponibles para un día específico
 * GET /api/citas/disponibilidad?fecha=2025-11-24&servicio_id=1
 */
const obtenerDisponibilidad = async (req, res) => {
  try {
    const { fecha, servicio_id } = req.query;

    if (!fecha || !servicio_id) {
      return res.status(400).json({
        error: 'Se requieren los parámetros: fecha y servicio_id'
      });
    }

    // Obtener servicio
    const servicioResult = await db.query(
      'SELECT duracion_minutos FROM servicios WHERE id = $1 AND activo = true',
      [servicio_id]
    );

    if (servicioResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Servicio no encontrado'
      });
    }

    const duracionMinutos = servicioResult.rows[0].duracion_minutos;

    // Parsear fecha
    const fechaConsulta = new Date(fecha);
    const diaSemana = fechaConsulta.getDay();

    // Obtener horario del día
    const horarioResult = await db.query(
      'SELECT * FROM horario_semanal WHERE dia_semana = $1',
      [diaSemana]
    );

    if (horarioResult.rows.length === 0 || !horarioResult.rows[0].es_laboral) {
      return res.status(200).json({
        fecha,
        disponible: false,
        mensaje: 'La barbería no atiende este día',
        horarios: []
      });
    }

    const horario = horarioResult.rows[0];

    // Obtener citas existentes del día
    const inicioDelDia = new Date(fechaConsulta);
    inicioDelDia.setHours(0, 0, 0, 0);
    
    const finDelDia = new Date(fechaConsulta);
    finDelDia.setHours(23, 59, 59, 999);

    const citasResult = await db.query(
      `SELECT fecha, hora_fin_calculada 
       FROM citas 
       WHERE estado = 'confirmada' 
         AND fecha >= $1 
         AND fecha <= $2
       ORDER BY fecha`,
      [inicioDelDia, finDelDia]
    );

    // Generar bloques disponibles (simplificado, devuelve info básica)
    res.status(200).json({
      fecha,
      disponible: true,
      horario: {
        apertura: horario.hora_apertura,
        cierre: horario.hora_cierre,
        descanso: horario.hora_descanso_inicio ? {
          inicio: horario.hora_descanso_inicio,
          fin: horario.hora_descanso_fin
        } : null
      },
      duracion_servicio_minutos: duracionMinutos,
      citas_existentes: citasResult.rows.length,
      mensaje: 'Consulte los bloques disponibles considerando las citas existentes'
    });
  } catch (error) {
    console.error('Error al obtener disponibilidad:', error);
    res.status(500).json({
      error: 'Error al obtener disponibilidad',
      detalle: error.message
    });
  }
};

module.exports = {
  crearCita,
  obtenerCitas,
  obtenerCitaPorId,
  cancelarCita,
  obtenerDisponibilidad
};
