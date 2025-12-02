-- Agregar columnas descripcion e imagen_url a tabla servicios
ALTER TABLE servicios 
ADD COLUMN IF NOT EXISTS descripcion TEXT,
ADD COLUMN IF NOT EXISTS imagen_url TEXT;

-- Actualizar servicios existentes con descripciones genéricas (opcional)
UPDATE servicios 
SET descripcion = 'Servicio de consulta o atención estándar'
WHERE descripcion IS NULL AND nombre LIKE '%Consulta%';

UPDATE servicios 
SET descripcion = 'Servicio de atención extendida o sesión completa'
WHERE descripcion IS NULL AND nombre LIKE '%Extendida%';
