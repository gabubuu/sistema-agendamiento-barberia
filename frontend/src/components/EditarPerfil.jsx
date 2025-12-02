import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export default function EditarPerfil({ open, onClose, onActualizar }) {
  const { usuario } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: ''
  });

  useEffect(() => {
    if (usuario && open) {
      setFormData({
        nombre: usuario.nombre || '',
        telefono: usuario.telefono || ''
      });
      setError(null);
      setSuccess(false);
    }
  }, [usuario, open]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Enviando datos de perfil actualizados
      
      const response = await axios.put(`${API_BASE_URL}/auth/perfil`, formData);
      // Perfil actualizado exitosamente
      
      setSuccess(true);
      
      // Actualizar el usuario en el contexto
      if (onActualizar) {
        // Actualizando contexto de usuario
        onActualizar(response.data.usuario);
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error al actualizar perfil:', err);
      console.error('Response data:', err.response?.data);
      setError(err.response?.data?.error || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          background: 'linear-gradient(145deg, #2a2a2a 0%, #1f1f1f 100%)',
        }
      }}
    >
      <DialogTitle sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
        Editar Perfil
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Perfil actualizado correctamente
              </Alert>
            )}

            <TextField
              label="Email"
              value={usuario?.email || ''}
              disabled
              fullWidth
              helperText="El email no se puede modificar"
            />

            <TextField
              label="Nombre completo"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              fullWidth
              autoFocus
            />

            <TextField
              label="Teléfono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              fullWidth
              placeholder="+56912345678"
              helperText="Incluye el código de país (ej: +56912345678)"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={onClose} 
            disabled={loading}
            sx={{ textTransform: 'none' }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{ textTransform: 'none', minWidth: 100 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Guardar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
