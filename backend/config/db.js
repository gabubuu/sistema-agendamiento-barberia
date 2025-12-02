const { Pool } = require('pg');

// Configuración del pool de conexiones a PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Necesario para Neon Tech y Render
  }
});

// Evento para manejar errores del pool
pool.on('error', (err) => {
  console.error('Error inesperado en el pool de PostgreSQL:', err);
  process.exit(-1);
});

// Función helper para ejecutar queries con manejo de errores
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Query ejecutada:', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Error en query:', { text, error: error.message });
    throw error;
  }
};

// Función para obtener un cliente del pool (para transacciones)
const getClient = async () => {
  const client = await pool.connect();
  const query = client.query;
  const release = client.release;

  // Timeout de 5 segundos para liberar el cliente
  const timeout = setTimeout(() => {
    console.error('Un cliente no fue liberado a tiempo');
  }, 5000);

  // Modificar release para limpiar el timeout
  client.release = () => {
    clearTimeout(timeout);
    client.release = release;
    return release.apply(client);
  };

  return client;
};

module.exports = {
  query,
  getClient,
  pool
};
