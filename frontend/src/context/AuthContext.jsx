import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const cargarUsuario = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`);
      setUsuario(response.data.usuario);
    } catch (error) {
      console.error('Error al cargar usuario:', error);
      localStorage.removeItem('token');
      setToken(null);
      setUsuario(null);
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  // Configurar axios con token de autenticación
  useEffect(() => {
    const tokenFromStorage = localStorage.getItem('token');
    if (tokenFromStorage) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${tokenFromStorage}`;
      setToken(tokenFromStorage);
      cargarUsuario();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      });

      const { token: newToken, usuario: newUsuario } = response.data;

      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUsuario(newUsuario);
      
      // Configurar el token en todas las peticiones de axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al iniciar sesión'
      };
    }
  };

  const register = async (nombre, email, password, telefono) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        nombre,
        email,
        password,
        telefono
      });

      const { token: newToken, usuario: newUsuario } = response.data;

      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUsuario(newUsuario);
      
      // Configurar el token en todas las peticiones de axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al registrar usuario'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUsuario(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const isAdmin = () => {
    return usuario?.rol === 'admin';
  };

  const isAuthenticated = () => {
    return !!usuario && !!token;
  };

  const actualizarUsuario = (nuevosDatos) => {
    // Actualización de datos de usuario
    setUsuario(prev => {
      const actualizado = { ...prev, ...nuevosDatos };
      // Usuario actualizado exitosamente
      return actualizado;
    });
  };

  const value = {
    usuario,
    token,
    loading,
    login,
    register,
    logout,
    isAdmin,
    isAuthenticated,
    actualizarUsuario
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
