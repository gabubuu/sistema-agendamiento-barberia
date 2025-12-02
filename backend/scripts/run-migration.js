const db = require('../config/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('Ejecutando migración: allow_null_horarios...');
    
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '../migrations/allow_null_horarios.sql'),
      'utf8'
    );
    
    await db.query(migrationSQL);
    
    console.log('Migración completada exitosamente');
  } catch (error) {
    console.error('❌ Error al ejecutar migración:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { runMigration };
