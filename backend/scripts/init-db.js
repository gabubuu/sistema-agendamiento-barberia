/**
 * Script de inicialización de la base de datos
 * Ejecutar con: node scripts/init-db.js
 */

require('dotenv').config();
const { pool } = require('../config/db');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
  console.log('Iniciando configuración de la base de datos...');

  try {
    // Leer el archivo schema.sql
    const schemaPath = path.join(__dirname, '../schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('Ejecutando script SQL...');
    
    // Ejecutar el schema
    await pool.query(schema);

    console.log('Tablas creadas exitosamente');
    console.log('Datos de ejemplo insertados');
    
    // Verificar las tablas
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('\nTablas en la base de datos:');
    result.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    // Contar registros
    const countHorarios = await pool.query('SELECT COUNT(*) FROM horario_semanal');
    const countServicios = await pool.query('SELECT COUNT(*) FROM servicios');
    const countCitas = await pool.query('SELECT COUNT(*) FROM citas');

    console.log('\nRegistros iniciales:');
    console.log(`   - Horarios: ${countHorarios.rows[0].count}`);
    console.log(`   - Servicios: ${countServicios.rows[0].count}`);
    console.log(`   - Citas: ${countCitas.rows[0].count}`);

    console.log('\nBase de datos inicializada correctamente!');
    
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Ejecutar
initDatabase();
