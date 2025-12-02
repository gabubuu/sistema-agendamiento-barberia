// URL base de la API - usa variable de entorno o fallback a Render
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://proyecto-backend-priv.onrender.com/api';

// Endpoints
export const ENDPOINTS = {
  servicios: `${API_BASE_URL}/servicios`,
  citas: `${API_BASE_URL}/citas`,
  horarios: `${API_BASE_URL}/configuracion/horario`,
};
