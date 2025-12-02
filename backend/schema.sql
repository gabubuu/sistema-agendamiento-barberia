-- ========================================
-- SCHEMA PARA SISTEMA DE AGENDAMIENTO
-- BARBERÍA - PostgreSQL 17
-- ========================================

-- Tabla para definir qué días y horas abre la barbería
CREATE TABLE IF NOT EXISTS horario_semanal (
    id SERIAL PRIMARY KEY,
    dia_semana INTEGER NOT NULL UNIQUE, -- 0=Domingo, 1=Lunes, ... 6=Sábado
    hora_apertura TIME NOT NULL,        -- Ej: '10:00'
    hora_cierre TIME NOT NULL,          -- Ej: '20:00'
    hora_descanso_inicio TIME,          -- Ej: '14:00' (Inicio colación)
    hora_descanso_fin TIME,             -- Ej: '15:00' (Fin colación)
    es_laboral BOOLEAN DEFAULT true     -- Si es false, ese día no se atiende
);

-- Tabla de servicios ofrecidos
CREATE TABLE IF NOT EXISTS servicios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,                   -- Descripción detallada del servicio
    duracion_minutos INTEGER NOT NULL,  -- Duración del bloque. Ej: 30, 45, 60.
    precio_clp INTEGER NOT NULL,        -- Precio en Pesos Chilenos (sin decimales).
    imagen_url TEXT,                    -- URL de la imagen del servicio
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de citas agendadas
CREATE TABLE IF NOT EXISTS citas (
    id SERIAL PRIMARY KEY,
    cliente_nombre VARCHAR(100) NOT NULL,
    cliente_email VARCHAR(100),
    servicio_id INTEGER REFERENCES servicios(id),
    fecha TIMESTAMP NOT NULL,           -- Fecha y hora de inicio de la cita
    hora_fin_calculada TIMESTAMP,       -- Se calcula: fecha + duracion_servicio
    estado VARCHAR(20) DEFAULT 'confirmada', -- 'confirmada', 'cancelada'
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_estado CHECK (estado IN ('confirmada', 'cancelada'))
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha);
CREATE INDEX IF NOT EXISTS idx_citas_estado ON citas(estado);
CREATE INDEX IF NOT EXISTS idx_servicios_activo ON servicios(activo);

-- Datos de ejemplo para horario semanal (Lunes a Viernes: 10:00-20:00, descanso 14:00-15:00)
INSERT INTO horario_semanal (dia_semana, hora_apertura, hora_cierre, hora_descanso_inicio, hora_descanso_fin, es_laboral)
VALUES 
    (1, '10:00', '20:00', '14:00', '15:00', true),  -- Lunes
    (2, '10:00', '20:00', '14:00', '15:00', true),  -- Martes
    (3, '10:00', '20:00', '14:00', '15:00', true),  -- Miércoles
    (4, '10:00', '20:00', '14:00', '15:00', true),  -- Jueves
    (5, '10:00', '20:00', '14:00', '15:00', true),  -- Viernes
    (6, '10:00', '16:00', NULL, NULL, true),        -- Sábado (sin descanso)
    (0, '10:00', '16:00', NULL, NULL, false)        -- Domingo (cerrado)
ON CONFLICT (dia_semana) DO NOTHING;

-- Datos de ejemplo para servicios (pueden ser reemplazados según el negocio)
INSERT INTO servicios (nombre, descripcion, duracion_minutos, precio_clp, imagen_url, activo)
VALUES 
    ('Consulta General', 'Consulta profesional estándar', 60, 25000, NULL, true),
    ('Sesión Extendida', 'Sesión de mayor duración', 90, 35000, NULL, true),
    ('Evaluación Inicial', 'Primera evaluación completa', 45, 20000, NULL, true)
ON CONFLICT DO NOTHING;
