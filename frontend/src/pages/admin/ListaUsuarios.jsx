import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Chip,
  TextField,
  InputAdornment,
  Grid
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import SearchIcon from '@mui/icons-material/Search';
import { obtenerTodosLosUsuarios } from '../../services/adminApi';

export default function ListaUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const data = await obtenerTodosLosUsuarios();
      setUsuarios(data.usuarios || []);
      setError(null);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
        setError('No se pudo conectar con el servidor.');
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        setError('No tienes permisos de administrador.');
      } else {
        setError(err.response?.data?.error || 'Error al cargar usuarios');
      }
    } finally {
      setLoading(false);
    }
  };

  const usuariosFiltrados = usuarios.filter(usuario =>
    usuario.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    usuario.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PeopleIcon fontSize="large" />
          Lista de usuarios
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Todos los usuarios registrados en el sistema
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card elevation={3} sx={{ mb: 3, bgcolor: '#1a1a1a', borderRadius: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Buscar usuario"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Nombre o email"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    '& fieldset': {
                      borderColor: '#444'
                    },
                    '&:hover fieldset': {
                      borderColor: '#666'
                    }
                  },
                  '& .MuiInputBase-input::placeholder': {
                    color: '#999',
                    opacity: 1
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card elevation={3} sx={{ bgcolor: '#1a1a1a', borderRadius: 2 }}>
        <CardContent>
          {usuariosFiltrados.length === 0 ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {busqueda ? 'No se encontraron usuarios con esa búsqueda' : 'No hay usuarios registrados'}
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#2a2a2a', borderBottom: '2px solid #444' }}>
                    <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Nombre</TableCell>
                    <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Email</TableCell>
                    <TableCell align="center" sx={{ color: '#fff', fontWeight: 'bold' }}>Rol</TableCell>
                    <TableCell align="center" sx={{ color: '#fff', fontWeight: 'bold' }}>Estado</TableCell>
                    <TableCell align="right" sx={{ color: '#fff', fontWeight: 'bold' }}>Registrado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {usuariosFiltrados.map((usuario) => (
                    <TableRow key={usuario.id} hover sx={{ '&:hover': { backgroundColor: '#2a2a2a' } }}>
                      <TableCell sx={{ color: '#fff' }}>
                        <Typography variant="body2" fontWeight="500">
                          {usuario.nombre}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ color: '#fff' }}>
                        <Typography variant="body2">
                          {usuario.email}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={usuario.rol === 'admin' ? 'Administrador' : 'Cliente'}
                          size="small"
                          color={usuario.rol === 'admin' ? 'primary' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={usuario.activo ? 'Activo' : 'Inactivo'}
                          size="small"
                          color={usuario.activo ? 'success' : 'error'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="caption" color="text.secondary">
                          {new Date(usuario.creado_en).toLocaleDateString('es-CL')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {usuariosFiltrados.length > 0 && (
            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Typography variant="body2" color="text.secondary">
                Total: {usuariosFiltrados.length} de {usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
