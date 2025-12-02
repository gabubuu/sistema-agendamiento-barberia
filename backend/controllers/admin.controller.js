const db = require('../config/db');

/**
 * Obtener configuración actual de horarios
 * GET /api/admin/configuracion
 */
const obtenerConfiguracion = async (req, res) => {
  try {
    const query = `
      SELECT 
        id,
        dias_laborales,
        hora_apertura,
        hora_cierre,
        bloques_duracion_minutos,
        actualizado_en
      FROM configuracion_horarios
      ORDER BY id DESC
      LIMIT 1
    `;

    const result = await db.query(query);

    if (result.rows.length === 0) {
      // Si no hay configuración, crear una por defecto
      const insertQuery = `
        INSERT INTO configuracion_horarios (dias_laborales, hora_apertura, hora_cierre, bloques_duracion_minutos)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      
      const defaultDias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
      const insertResult = await db.query(insertQuery, [
        JSON.stringify(defaultDias),
        '10:00:00',
        '19:00:00',
        60
      ]);

      return res.status(200).json({
        configuracion: insertResult.rows[0]
      });
    }

    res.status(200).json({
      configuracion: result.rows[0]
    });
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    res.status(500).json({
      error: 'Error al obtener configuración',
      detalle: error.message
    });
  }
};

/**
 * Actualizar configuración de horarios
 * PUT /api/admin/configuracion
 */
const actualizarConfiguracion = async (req, res) => {
  const client = await db.getClient();
  
  try {
    const { dias_laborales, hora_apertura, hora_cierre, bloques_duracion_minutos } = req.body;
    const usuarioId = req.usuario.id;

    // Validaciones
    if (!dias_laborales || !Array.isArray(dias_laborales)) {
      return res.status(400).json({
        error: 'dias_laborales debe ser un array'
      });
    }

    if (dias_laborales.length === 0) {
      return res.status(400).json({
        error: 'Debe seleccionar al menos un día laboral'
      });
    }

    const diasValidos = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
    const diasInvalidos = dias_laborales.filter(dia => !diasValidos.includes(dia));
    
    if (diasInvalidos.length > 0) {
      return res.status(400).json({
        error: `Días inválidos: ${diasInvalidos.join(', ')}`
      });
    }

    if (!hora_apertura || !hora_cierre) {
      return res.status(400).json({
        error: 'hora_apertura y hora_cierre son obligatorios'
      });
    }

    // Validar que hora_cierre sea mayor que hora_apertura
    if (hora_cierre <= hora_apertura) {
      return res.status(400).json({
        error: 'La hora de cierre debe ser posterior a la hora de apertura'
      });
    }

    await client.query('BEGIN');

    // Verificar si existe configuración
    const checkQuery = 'SELECT id FROM configuracion_horarios ORDER BY id DESC LIMIT 1';
    const checkResult = await client.query(checkQuery);

    let result;
    if (checkResult.rows.length === 0) {
      // No existe, hacer INSERT
      const insertQuery = `
        INSERT INTO configuracion_horarios 
          (dias_laborales, hora_apertura, hora_cierre, bloques_duracion_minutos, actualizado_por)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      result = await client.query(insertQuery, [
        JSON.stringify(dias_laborales),
        hora_apertura,
        hora_cierre,
        bloques_duracion_minutos || 60,
        usuarioId
      ]);
    } else {
      // Ya existe, hacer UPDATE
      const configId = checkResult.rows[0].id;
      const updateQuery = `
        UPDATE configuracion_horarios
        SET 
          dias_laborales = $1,
          hora_apertura = $2,
          hora_cierre = $3,
          bloques_duracion_minutos = $4,
          actualizado_en = CURRENT_TIMESTAMP,
          actualizado_por = $5
        WHERE id = $6
        RETURNING *
      `;
      result = await client.query(updateQuery, [
        JSON.stringify(dias_laborales),
        hora_apertura,
        hora_cierre,
        bloques_duracion_minutos || 60,
        usuarioId,
        configId
      ]);
    }

    // Mapeo de días en español a número (0=domingo, 1=lunes, ...)
    const diasMap = {
      'domingo': 0,
      'lunes': 1,
      'martes': 2,
      'miercoles': 3,
      'jueves': 4,
      'viernes': 5,
      'sabado': 6
    };

    // Sincronizar con horario_semanal
    for (let i = 0; i < 7; i++) {
      const diaEspanol = Object.keys(diasMap).find(key => diasMap[key] === i);
      const esLaboral = dias_laborales.includes(diaEspanol);

      const valores = {
        dia_semana: i,
        hora_apertura: esLaboral ? hora_apertura : null,
        hora_cierre: esLaboral ? hora_cierre : null,
        es_laboral: esLaboral
      };

      const queryHorario = `
        INSERT INTO horario_semanal 
          (dia_semana, hora_apertura, hora_cierre, hora_descanso_inicio, hora_descanso_fin, es_laboral)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (dia_semana) 
        DO UPDATE SET
          hora_apertura = EXCLUDED.hora_apertura,
          hora_cierre = EXCLUDED.hora_cierre,
          hora_descanso_inicio = EXCLUDED.hora_descanso_inicio,
          hora_descanso_fin = EXCLUDED.hora_descanso_fin,
          es_laboral = EXCLUDED.es_laboral
        RETURNING *
      `;

      const resultado = await client.query(queryHorario, [
        i,
        esLaboral ? hora_apertura : null,
        esLaboral ? hora_cierre : null,
        null,
        null,
        esLaboral
      ]);
    }

    await client.query('COMMIT');

    res.status(200).json({
      mensaje: 'Configuración actualizada exitosamente',
      configuracion: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al actualizar configuración:', error);
    res.status(500).json({
      error: 'Error al actualizar configuración',
      detalle: error.message
    });
  } finally {
    client.release();
  }
};

/**
 * Obtener estadísticas del dashboard
 * GET /api/admin/estadisticas
 */
const obtenerEstadisticas = async (req, res) => {
  try {
    // Total de citas
    const totalCitasQuery = `
      SELECT COUNT(*) as total
      FROM citas
      WHERE estado = 'confirmada'
    `;
    
    // Ingresos del mes actual
    const ingresosQuery = `
      SELECT COALESCE(SUM(s.precio_clp), 0) as total_ingresos
      FROM citas c
      JOIN servicios s ON c.servicio_id = s.id
      WHERE c.estado = 'confirmada'
        AND EXTRACT(YEAR FROM c.fecha) = EXTRACT(YEAR FROM CURRENT_DATE)
        AND EXTRACT(MONTH FROM c.fecha) = EXTRACT(MONTH FROM CURRENT_DATE)
    `;

    // Próximas citas (próximos 7 días)
    const proximasCitasQuery = `
      SELECT COUNT(*) as total
      FROM citas
      WHERE estado = 'confirmada'
        AND fecha >= CURRENT_TIMESTAMP
        AND fecha <= CURRENT_TIMESTAMP + INTERVAL '7 days'
    `;

    // Citas de hoy
    const citasHoyQuery = `
      SELECT COUNT(*) as total
      FROM citas
      WHERE estado = 'confirmada'
        AND DATE(fecha) = CURRENT_DATE
    `;

    // Total de clientes registrados
    const totalClientesQuery = `
      SELECT COUNT(*) as total
      FROM usuarios
      WHERE rol = 'cliente' AND activo = true
    `;

    const [totalCitas, ingresos, proximasCitas, citasHoy, totalClientes] = await Promise.all([
      db.query(totalCitasQuery),
      db.query(ingresosQuery),
      db.query(proximasCitasQuery),
      db.query(citasHoyQuery),
      db.query(totalClientesQuery)
    ]);

    res.status(200).json({
      estadisticas: {
        total_citas: parseInt(totalCitas.rows[0].total),
        total_ingresos: parseInt(ingresos.rows[0].total_ingresos),
        proximas_citas: parseInt(proximasCitas.rows[0].total),
        citas_hoy: parseInt(citasHoy.rows[0].total),
        total_clientes: parseInt(totalClientes.rows[0].total)
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      error: 'Error al obtener estadísticas',
      detalle: error.message
    });
  }
};

/**
 * Obtener todas las citas (para admin)
 * GET /api/admin/citas
 */
const obtenerTodasCitas = async (req, res) => {
  try {
    const { fecha, estado, busqueda } = req.query;
    
    let sqlQuery = `
      SELECT 
        c.id,
        c.fecha,
        c.estado,
        c.cliente_nombre,
        c.cliente_email,
        c.usuario_id,
        s.nombre as servicio_nombre,
        s.precio_clp,
        s.duracion_minutos,
        u.nombre as usuario_nombre,
        u.email as usuario_email
      FROM citas c
      JOIN servicios s ON c.servicio_id = s.id
      LEFT JOIN usuarios u ON c.usuario_id = u.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (fecha && fecha.trim() !== '') {
      // Convertir la fecha a rango completo del día en UTC
      try {
        const fechaInicio = new Date(fecha + 'T00:00:00.000Z');
        const fechaFin = new Date(fecha + 'T23:59:59.999Z');
        
        sqlQuery += ` AND c.fecha >= $${paramCount} AND c.fecha <= $${paramCount + 1}`;
        params.push(fechaInicio.toISOString(), fechaFin.toISOString());
        paramCount += 2;
      } catch (err) {
        console.error('Error al procesar fecha:', err);
      }
    }

    if (estado && estado.trim() !== '') {
      sqlQuery += ` AND c.estado = $${paramCount}`;
      params.push(estado);
      paramCount++;
    }

    if (busqueda && busqueda.trim() !== '') {
      sqlQuery += ` AND (c.cliente_nombre ILIKE $${paramCount} OR c.cliente_email ILIKE $${paramCount})`;
      params.push(`%${busqueda}%`);
      paramCount++;
    }

    sqlQuery += ' ORDER BY c.fecha DESC';

    const result = await db.query(sqlQuery, params);

    res.status(200).json({
      citas: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('❌ Error al obtener todas las citas:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      error: 'Error al obtener citas',
      detalle: error.message
    });
  }
};

const eliminarCita = async (req, res) => {
  try {
    const { id } = req.params;
    
    const sqlQuery = 'DELETE FROM citas WHERE id = $1 RETURNING *';
    const result = await db.query(sqlQuery, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Cita no encontrada'
      });
    }
    
    res.status(200).json({
      mensaje: 'Cita eliminada exitosamente',
      cita: result.rows[0]
    });
  } catch (error) {
    console.error('Error al eliminar cita:', error);
    res.status(500).json({
      error: 'Error al eliminar cita',
      detalle: error.message
    });
  }
};

/**
 * Limpiar todas las citas canceladas
 * DELETE /api/admin/citas-canceladas/limpiar/todas
 */
const limpiarCitasCanceladas = async (req, res) => {
  try {
    const query = 'DELETE FROM citas WHERE estado = $1 RETURNING id';
    const result = await db.query(query, ['cancelada']);

    res.status(200).json({
      mensaje: `Se eliminaron ${result.rows.length} citas canceladas exitosamente`,
      total_eliminadas: result.rows.length
    });
  } catch (error) {
    console.error('Error al limpiar citas canceladas:', error);
    res.status(500).json({
      error: 'Error al limpiar citas canceladas',
      detalle: error.message
    });
  }
};

/**
 * Obtener todos los usuarios registrados
 * GET /api/admin/usuarios
 */
const obtenerTodosLosUsuarios = async (req, res) => {
  try {
    const query = `
      SELECT 
        id,
        nombre,
        email,
        rol,
        activo,
        creado_en
      FROM usuarios
      ORDER BY creado_en DESC
    `;

    const result = await db.query(query);

    res.status(200).json({
      usuarios: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({
      error: 'Error al obtener usuarios',
      detalle: error.message
    });
  }
};

module.exports = {
  obtenerConfiguracion,
  actualizarConfiguracion,
  obtenerEstadisticas,
  obtenerTodasCitas,
  eliminarCita,
  limpiarCitasCanceladas,
  obtenerTodosLosUsuarios
};
