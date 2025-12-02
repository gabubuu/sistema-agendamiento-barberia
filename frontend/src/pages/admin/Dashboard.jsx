import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TodayIcon from '@mui/icons-material/Today';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { obtenerEstadisticas, obtenerTodosLosUsuarios } from '../../services/adminApi';

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <Card 
    elevation={3}
    sx={{
      height: '100%',
      background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
      border: `1px solid ${color}30`,
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
      }
    }}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 56,
            height: 56,
            borderRadius: 2,
            bgcolor: `${color}20`,
            mr: 2
          }}
        >
          <Icon sx={{ fontSize: 32, color }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold">
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const [estadisticas, setEstadisticas] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const estadisticasData = await obtenerEstadisticas();
      setEstadisticas(estadisticasData.estadisticas);
      
      // Cargar usuarios sin bloquear si falla
      try {
        const usuariosData = await obtenerTodosLosUsuarios();
        setUsuarios(usuariosData.usuarios || []);
      } catch (err) {
        console.warn('No se pudieron cargar los usuarios:', err);
        setUsuarios([]);
      }
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
      if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
        setError('No se pudo conectar con el servidor. Verifica que el backend esté desplegado.');
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        setError('No tienes permisos de administrador o tu sesión expiró.');
      } else {
        setError(err.response?.data?.error || 'Error al cargar estadísticas');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Vista general de tu negocio
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Citas de hoy"
            value={estadisticas?.citas_hoy || 0}
            icon={TodayIcon}
            color="#2196f3"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Próximas citas"
            value={estadisticas?.proximas_citas || 0}
            icon={EventIcon}
            color="#4caf50"
            subtitle="Próximos 7 días"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total de citas"
            value={estadisticas?.total_citas || 0}
            icon={TrendingUpIcon}
            color="#ff9800"
            subtitle="Confirmadas"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Ingresos del mes"
            value={`$${(estadisticas?.total_ingresos || 0).toLocaleString('es-CL')}`}
            icon={AttachMoneyIcon}
            color="#9c27b0"
            subtitle="Mes actual"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total clientes"
            value={estadisticas?.total_clientes || 0}
            icon={PeopleIcon}
            color="#f44336"
            subtitle="Registrados"
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
          Usuarios registrados ({usuarios.length})
        </Typography>
        <Card elevation={3}>
          <CardContent>
            {usuarios.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No hay usuarios registrados aún
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell><strong>Nombre</strong></TableCell>
                      <TableCell><strong>Email</strong></TableCell>
                      <TableCell align="center"><strong>Rol</strong></TableCell>
                      <TableCell align="center"><strong>Estado</strong></TableCell>
                      <TableCell align="right"><strong>Registrado</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usuarios.slice(0, 10).map((usuario) => (
                      <TableRow key={usuario.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="500">
                            {usuario.nombre}
                          </Typography>
                        </TableCell>
                        <TableCell>
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
            {usuarios.length > 10 && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                Mostrando 10 de {usuarios.length} usuarios
              </Typography>
            )}
          </CardContent>
        </Card>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Información rápida
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              • Usa el menú lateral para navegar entre las diferentes secciones
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              • En "Configuración de horarios" puedes definir días y horas de trabajo
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              • En "Servicios" puedes agregar, editar o eliminar servicios
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • En "Todas las citas" puedes ver y filtrar todas las reservas
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
