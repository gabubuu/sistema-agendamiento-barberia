-- Permitir NULL en hora_apertura y hora_cierre para días no laborales
-- Migración: 2025-11-24

ALTER TABLE horario_semanal 
  ALTER COLUMN hora_apertura DROP NOT NULL,
  ALTER COLUMN hora_cierre DROP NOT NULL;

-- Comentario actualizado
COMMENT ON COLUMN horario_semanal.hora_apertura IS 'Hora de apertura (NULL si es_laboral=false)';
COMMENT ON COLUMN horario_semanal.hora_cierre IS 'Hora de cierre (NULL si es_laboral=false)';
