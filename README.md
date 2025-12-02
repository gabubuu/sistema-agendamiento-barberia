# Sistema de agendamiento de barbería

Proyecto de título que permite a una barbería gestionar sus citas online. Los clientes pueden ver servicios, agendar citas y los administradores pueden gestionar todo desde un panel web.

## Descripción del proyecto

Es un sistema web completo que tiene:
- **Frontend**: Aplicación web en React donde los clientes agendan citas
- **Backend**: API REST en Node.js que maneja toda la lógica
- **Base de datos**: PostgreSQL para guardar todo

Los clientes pueden ver los servicios disponibles, elegir fecha y hora, y agendar su cita. Los administradores pueden configurar horarios, gestionar servicios y ver todas las citas.

## Tecnologías usadas

### Backend
- **Node.js** (v18+) - Servidor
- **Express.js** - Framework web
- **PostgreSQL 17** - Base de datos (Neon Tech)
- **JWT** - Autenticación
- **bcrypt** - Encriptación de contraseñas

### Frontend  
- **React** - Interfaz de usuario
- **Material UI** - Componentes visuales
- **Axios** - Comunicación con API
- **Vite** - Build tool

## Estructura del proyecto

```
backend/                            # API REST
├── config/                         # Configuración BD
├── controllers/                    # Lógica de negocio
├── routes/                         # Endpoints
├── middleware/                     # Autenticación
├── scripts/                        # Scripts de BD
├── schema.sql                      # Estructura de BD
└── index.js                        # Servidor principal

frontend/                           # Aplicación web
├── src/
│   ├── components/                 # Componentes React
│   ├── pages/                      # Páginas principales
│   ├── context/                    # Context API (auth)
│   └── services/                   # Comunicación con API
├── public/                         # Archivos estáticos
└── index.html                      # Página principal
```

## Cómo instalar y ejecutar

### 1. Clonar el repositorio
```bash
git clone [url-del-repo]
cd sistema-agendamiento-barberia
```

### 2. Configurar el backend
```bash
cd backend
npm install

# Crear archivo .env basado en .env.example
DATABASE_URL=postgresql://usuario:contraseña@host:puerto/database?sslmode=require
PORT=3001
JWT_SECRET=tu_clave_secreta_jwt

# Crear las tablas
npm run init-db

# Iniciar servidor
npm run dev
```

### 3. Configurar el frontend
```bash
cd ../frontend
npm install

# Iniciar aplicación web
npm run dev
```

### 4. Acceder al sistema
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Funcionalidades principales

### Para clientes
- Ver servicios disponibles con precios y duración
- Agendar citas eligiendo servicio, fecha y hora
- Ver sus citas agendadas
- Cancelar citas si es necesario

### Para administradores
- Gestionar servicios (crear, editar, desactivar)
- Configurar horarios de atención por día
- Ver todas las citas del sistema
- Administrar usuarios registrados
- Dashboard con estadísticas

## Base de datos

El sistema usa PostgreSQL con estas tablas principales:
- **usuarios**: Clientes y administradores
- **servicios**: Catálogo de servicios de la barbería  
- **citas**: Reservas agendadas por los clientes
- **horario_semanal**: Horarios de atención por día

## API principal

La API maneja estos endpoints principales:
- `/api/auth/*` - Login y registro de usuarios
- `/api/servicios/*` - CRUD de servicios de la barbería  
- `/api/citas/*` - Agendamiento y gestión de citas
- `/api/configuracion/*` - Horarios de atención
- `/api/admin/*` - Funciones administrativas

### Validaciones importantes
- Las citas se validan para evitar conflictos de horario
- Solo se puede agendar en días y horarios laborales  
- No se permiten citas superpuestas
- Los servicios deben estar activos para agendar

## Características técnicas

- **Autenticación**: Sistema de login con JWT
- **Roles**: Clientes y administradores con permisos diferentes  
- **Validaciones**: Las citas se validan para evitar conflictos de horario
- **Responsive**: El frontend funciona en móvil y escritorio
- **API REST**: Backend con endpoints organizados por funcionalidad

## Despliegue

### Backend (Render)
1. Conectar repo de GitHub
2. Configurar variables de entorno
3. Build: `npm install`
4. Start: `npm start`
5. Ejecutar `schema.sql` en la base de datos

### Frontend (Netlify/Vercel)  
1. Conectar repo
2. Build: `npm run build`
3. Publish directory: `dist`

## Capturas del sistema

### Vista principal (clientes)
- Landing page con información de la barbería
- Catálogo de servicios
- Formulario de agendamiento paso a paso
- Panel para ver citas agendadas

### Panel administrativo  
- Dashboard con estadísticas
- Gestión de servicios
- Configuración de horarios
- Lista de todas las citas
- Administración de usuarios

## Proyecto de título

Sistema desarrollado como proyecto de título de Ingeniería. 
Implementa un caso real de negocio con tecnologías web modernas.