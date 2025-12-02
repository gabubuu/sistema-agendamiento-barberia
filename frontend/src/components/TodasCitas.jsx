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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Tooltip
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import EventIcon from '@mui/icons-material/Event';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { obtenerTodasLasCitas, eliminarCita } from '../../services/adminApi';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('es');

const getEstadoColor = (estado) => {
  switch (estado) {
    case 'confirmada':
      return 'success';
    case 'cancelada':
      return 'error';
    case 'completada':
      return 'info';
    default:
      return 'default';
  }
};

const getEstadoLabel = (estado) => {
  switch (estado) {
    case 'confirmada':
      return 'Confirmada';
    case 'cancelada':
      return 'Cancelada';
    case 'completada':
      return 'Completada';
    default:
      return estado;
  }
};

export default function TodasCitas() {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogEliminar, setDialogEliminar] = useState({ open: false, citaId: null });
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);

  const [filtros, setFiltros] = useState({
    fecha: '',
    estado: '',
    busqueda: ''
  });

  useEffect(() => {
    cargarCitas();
  }, [filtros]);

  const cargarCitas = async () => {
    try {
      setLoading(true);
      const data = await obtenerTodasLasCitas(filtros);
      setCitas(data.citas || []);
      setError(null);
    } catch (err) {
      console.error('Error al cargar citas:', err);
      if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
        setError('No se pudo conectar con el servidor. El backend está desplegándose, intenta en unos minutos.');
      } else if (err.response?.status === 404) {
        setError('Endpoint no encontrado. Verifica que el backend esté actualizado.');
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        setError('No tienes permisos de administrador.');
      } else {
        setError(err.response?.data?.error || 'Error al cargar citas. Si no hay citas aún, este mensaje es normal.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (e) => {
    setFiltros({
      ...filtros,
      [e.target.name]: e.target.value
    });
  };

  const handleFechaChange = (newDate) => {
    setFechaSeleccionada(newDate);
    setFiltros({
      ...filtros,
      fecha: newDate ? newDate.format('YYYY-MM-DD') : ''
    });
  };

  const limpiarFiltros = () => {
    setFiltros({
      fecha: '',
      estado: '',
      busqueda: ''
    });
    setFechaSeleccionada(null);
  };

  const handleEliminarClick = (citaId) => {
    setDialogEliminar({ open: true, citaId });
  };

  const handleEliminarConfirmar = async () => {
    try {
      await eliminarCita(dialogEliminar.citaId);
      setDialogEliminar({ open: false, citaId: null });
      cargarCitas(); // Recargar las citas
    } catch (err) {
      console.error('Error al eliminar cita:', err);
      setError('Error al eliminar la cita');
    }
  };

  const handleEliminarCancelar = () => {
    setDialogEliminar({ open: false, citaId: null });
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EventIcon fontSize="large" />
          Todas las citas
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Vista completa de las reservas
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card elevation={3} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            Filtros
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={2.5}>
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                <DatePicker
                  label="Fecha"
                  value={fechaSeleccionada}
                  onChange={handleFechaChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      InputProps: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <EventIcon />
                          </InputAdornment>
                        ),
                      }
                    }
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ minWidth: 150 }}>
                <InputLabel>Estado</InputLabel>
                <Select
                  name="estado"
                  value={filtros.estado}
                  onChange={handleFiltroChange}
                  label="Estado"
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        minWidth: 150
                      }
                    }
                  }}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="confirmada">Confirmada</MenuItem>
                  <MenuItem value="cancelada">Cancelada</MenuItem>
                  <MenuItem value="completada">Completada</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3.5}>
              <TextField
                fullWidth
                name="busqueda"
                label="Buscar cliente"
                value={filtros.busqueda}
                onChange={handleFiltroChange}
                placeholder="Nombre o email"
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
          {(filtros.fecha || filtros.estado || filtros.busqueda) && (
            <Box sx={{ mt: 2 }}>
              <Typography
                variant="caption"
                color="primary"
                sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                onClick={limpiarFiltros}
              >
                Limpiar filtros
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Card elevation={3}>
        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Fecha y hora</strong></TableCell>
                    <TableCell><strong>Cliente</strong></TableCell>
                    <TableCell><strong>Servicio</strong></TableCell>
                    <TableCell align="center"><strong>Duración</strong></TableCell>
                    <TableCell align="right"><strong>Precio</strong></TableCell>
                    <TableCell align="center"><strong>Estado</strong></TableCell>
                    <TableCell align="center"><strong>Acciones</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {citas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body2" color="text.secondary" py={4}>
                          No se encontraron citas con los filtros aplicados
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    citas.map((cita) => (
                      <TableRow key={cita.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {dayjs.utc(cita.fecha).tz('America/Santiago').format('DD/MM/YYYY')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {dayjs.utc(cita.fecha).tz('America/Santiago').format('HH:mm')} hrs
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {cita.cliente_nombre}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {cita.cliente_email}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {cita.servicio_nombre}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`${cita.duracion_minutos} min`}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="bold">
                            ${cita.precio_clp.toLocaleString('es-CL')}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={getEstadoLabel(cita.estado)}
                            color={getEstadoColor(cita.estado)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          {cita.estado === 'cancelada' ? (
                            <Tooltip title="Eliminar cita cancelada">
                              <IconButton
                                color="error"
                                onClick={() => handleEliminarClick(cita.id)}
                                size="small"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              —
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          {!loading && citas.length > 0 && (
            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Typography variant="body2" color="text.secondary">
                Total: {citas.length} cita{citas.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Dialog de confirmación para eliminar */}
      <Dialog open={dialogEliminar.open} onClose={handleEliminarCancelar}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar esta cita? Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEliminarCancelar} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleEliminarConfirmar} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
