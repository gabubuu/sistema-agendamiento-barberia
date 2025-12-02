const db = require('../config/db');

/**
 * Configurar u obtener horario semanal
 * POST /api/configuracion/horario
 * Body: Array de 7 objetos con la configuración de cada día
 */
const configurarHorarioSemanal = async (req, res) => {
  try {
    const horarios = req.body; // Array de objetos

    console.log('📥 Recibiendo configuración de horarios:', horarios);

    // Validar que sea un array con 7 elementos
    if (!Array.isArray(horarios) || horarios.length !== 7) {
      return res.status(400).json({
        error: 'Se requiere un array con 7 elementos (uno por cada día de la semana)'
      });
    }

    // Validar estructura de cada día
    for (const horario of horarios) {
      if (
        typeof horario.dia_semana !== 'number' ||
        horario.dia_semana < 0 ||
        horario.dia_semana > 6
      ) {
        return res.status(400).json({
          error: 'dia_semana debe ser un número entre 0 (Domingo) y 6 (Sábado)'
        });
      }
    }

    // Hacer UPSERT para cada día
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      const resultados = [];

      for (const horario of horarios) {
        const query = `
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
          RETURNING *;
        `;

        const values = [
          horario.dia_semana,
          horario.hora_apertura,
          horario.hora_cierre,
          horario.hora_descanso_inicio || null,
          horario.hora_descanso_fin || null,
          horario.es_laboral !== undefined ? horario.es_laboral : true
        ];

        const result = await client.query(query, values);
        resultados.push(result.rows[0]);
      }

      await client.query('COMMIT');

      res.status(200).json({
        mensaje: 'Horario semanal configurado correctamente',
        horarios: resultados
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error al configurar horario semanal:', error);
    res.status(500).json({
      error: 'Error al configurar el horario',
      detalle: error.message
    });
  }
};

/**
 * Obtener horario semanal configurado
 * GET /api/configuracion/horario
 */
const obtenerHorarioSemanal = async (req, res) => {
  try {
    const query = 'SELECT * FROM horario_semanal ORDER BY dia_semana';
    const result = await db.query(query);

    console.log('📤 Enviando horario semanal al frontend:', {
      cantidad: result.rows.length,
      horarios: result.rows
    });

    res.status(200).json({
      horarios: result.rows
    });
  } catch (error) {
    console.error('Error al obtener horario semanal:', error);
    res.status(500).json({
      error: 'Error al obtener el horario',
      detalle: error.message
    });
  }
};

module.exports = {
  configurarHorarioSemanal,
  obtenerHorarioSemanal
};
