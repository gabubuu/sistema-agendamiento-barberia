import axios from 'axios';
import { ENDPOINTS } from '../config/api';

// Obtener todos los servicios
export const obtenerServicios = async () => {
  const response = await axios.get(ENDPOINTS.servicios);
  return response.data;
};

// Obtener todas las citas
export const obtenerCitas = async (filtros = {}) => {
  const params = new URLSearchParams(filtros);
  const response = await axios.get(`${ENDPOINTS.citas}?${params}`);
  return response.data;
};

// Crear una nueva cita
export const crearCita = async (citaData) => {
  const response = await axios.post(ENDPOINTS.citas, citaData);
  return response.data;
};

// Cancelar una cita
export const cancelarCita = async (citaId) => {
  const response = await axios.patch(`${ENDPOINTS.citas}/${citaId}/cancelar`);
  return response.data;
};

// Obtener horarios configurados
export const obtenerHorarios = async () => {
  const response = await axios.get(ENDPOINTS.horarios);
  return response.data;
};

// Obtener horario semanal (incluye días laborales y horarios de descanso)
export const obtenerHorarioSemanal = async () => {
  const response = await axios.get(ENDPOINTS.horarios);
  return response.data;
};
