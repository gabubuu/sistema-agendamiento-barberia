import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// Helper para agregar el token a las peticiones
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Estadísticas
export const obtenerEstadisticas = async () => {
  const response = await axios.get(`${API_BASE_URL}/admin/estadisticas`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Configuración de horarios - USAR EL MISMO ENDPOINT QUE EL CLIENTE
export const obtenerConfiguracion = async () => {
  const response = await axios.get(`${API_BASE_URL}/configuracion/horario`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

export const actualizarConfiguracion = async (configuracion) => {
  const response = await axios.post(`${API_BASE_URL}/configuracion/horario`, configuracion, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Citas (vista admin)
export const obtenerTodasLasCitas = async (filtros = {}) => {
  const params = new URLSearchParams();
  if (filtros.fecha) params.append('fecha', filtros.fecha);
  if (filtros.estado) params.append('estado', filtros.estado);
  if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
  
  const response = await axios.get(`${API_BASE_URL}/admin/citas?${params.toString()}`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

export const eliminarCita = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/admin/citas/${id}`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

export const limpiarCitasCanceladas = async () => {
  const response = await axios.delete(`${API_BASE_URL}/admin/citas-canceladas/limpiar/todas`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Usuarios
export const obtenerTodosLosUsuarios = async () => {
  const response = await axios.get(`${API_BASE_URL}/admin/usuarios`, {
    headers: getAuthHeaders()
  });
  return response.data;
};

// Servicios (CRUD)
export const crearServicio = async (servicio) => {
  const response = await axios.post(`${API_BASE_URL}/servicios`, servicio, {
    headers: getAuthHeaders()
  });
  return response.data;
};

export const actualizarServicio = async (id, servicio) => {
  const response = await axios.put(`${API_BASE_URL}/servicios/${id}`, servicio, {
    headers: getAuthHeaders()
  });
  return response.data;
};

export const eliminarServicio = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/servicios/${id}`, {
    headers: getAuthHeaders()
  });
  return response.data;
};
