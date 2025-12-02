const db = require('../config/db');

/**
 * Obtener todos los servicios activos
 * GET /api/servicios
 */
const obtenerServicios = async (req, res) => {
  try {
    const query = `
      SELECT id, nombre, descripcion, duracion_minutos, precio_clp, imagen_url, activo
      FROM servicios
      WHERE activo = true
      ORDER BY nombre;
    `;

    const result = await db.query(query);

    res.status(200).json({
      servicios: result.rows
    });
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    res.status(500).json({
      error: 'Error al obtener servicios',
      detalle: error.message
    });
  }
};

/**
 * Crear un nuevo servicio
 * POST /api/servicios
 * Body: { nombre, duracion_minutos, precio_clp }
 */
const crearServicio = async (req, res) => {
  try {
    const { nombre, descripcion, duracion_minutos, precio_clp, imagen_url } = req.body;

    // Validaciones
    if (!nombre || !duracion_minutos || !precio_clp) {
      return res.status(400).json({
        error: 'Faltan campos requeridos: nombre, duracion_minutos, precio_clp'
      });
    }

    if (typeof duracion_minutos !== 'number' || duracion_minutos <= 0) {
      return res.status(400).json({
        error: 'duracion_minutos debe ser un número positivo'
      });
    }

    if (typeof precio_clp !== 'number' || precio_clp <= 0) {
      return res.status(400).json({
        error: 'precio_clp debe ser un número entero positivo'
      });
    }

    const query = `
      INSERT INTO servicios (nombre, descripcion, duracion_minutos, precio_clp, imagen_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const values = [nombre, descripcion || null, duracion_minutos, Math.floor(precio_clp), imagen_url || null];
    const result = await db.query(query, values);

    res.status(201).json({
      mensaje: 'Servicio creado exitosamente',
      servicio: result.rows[0]
    });
  } catch (error) {
    console.error('Error al crear servicio:', error);
    res.status(500).json({
      error: 'Error al crear servicio',
      detalle: error.message
    });
  }
};

/**
 * Actualizar un servicio existente
 * PUT /api/servicios/:id
 */
const actualizarServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, duracion_minutos, precio_clp, imagen_url, activo } = req.body;

    // Construir query dinámica según campos proporcionados
    const updates = [];
    const values = [];
    let paramCounter = 1;

    if (nombre !== undefined) {
      updates.push(`nombre = $${paramCounter++}`);
      values.push(nombre);
    }
    if (descripcion !== undefined) {
      updates.push(`descripcion = $${paramCounter++}`);
      values.push(descripcion);
    }
    if (duracion_minutos !== undefined) {
      updates.push(`duracion_minutos = $${paramCounter++}`);
      values.push(duracion_minutos);
    }
    if (precio_clp !== undefined) {
      updates.push(`precio_clp = $${paramCounter++}`);
      values.push(Math.floor(precio_clp));
    }
    if (imagen_url !== undefined) {
      updates.push(`imagen_url = $${paramCounter++}`);
      values.push(imagen_url);
    }
    if (activo !== undefined) {
      updates.push(`activo = $${paramCounter++}`);
      values.push(activo);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        error: 'No se proporcionaron campos para actualizar'
      });
    }

    values.push(id);
    const query = `
      UPDATE servicios
      SET ${updates.join(', ')}
      WHERE id = $${paramCounter}
      RETURNING *;
    `;

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Servicio no encontrado'
      });
    }

    res.status(200).json({
      mensaje: 'Servicio actualizado exitosamente',
      servicio: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar servicio:', error);
    res.status(500).json({
      error: 'Error al actualizar servicio',
      detalle: error.message
    });
  }
};

/**
 * Eliminar un servicio (soft delete - marcar como inactivo)
 * DELETE /api/servicios/:id
 */
const eliminarServicio = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si hay citas pendientes con este servicio
    const citasQuery = `
      SELECT COUNT(*) as total
      FROM citas
      WHERE servicio_id = $1 
        AND estado = 'confirmada' 
        AND fecha >= CURRENT_TIMESTAMP
    `;
    
    const citasResult = await db.query(citasQuery, [id]);
    
    if (parseInt(citasResult.rows[0].total) > 0) {
      return res.status(400).json({
        error: 'No se puede eliminar el servicio porque tiene citas pendientes'
      });
    }

    // Soft delete - marcar como inactivo
    const query = `
      UPDATE servicios
      SET activo = false
      WHERE id = $1
      RETURNING *;
    `;

    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Servicio no encontrado'
      });
    }

    res.status(200).json({
      mensaje: 'Servicio eliminado exitosamente',
      servicio: result.rows[0]
    });
  } catch (error) {
    console.error('Error al eliminar servicio:', error);
    res.status(500).json({
      error: 'Error al eliminar servicio',
      detalle: error.message
    });
  }
};

module.exports = {
  obtenerServicios,
  crearServicio,
  actualizarServicio,
  eliminarServicio
};
