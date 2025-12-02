import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { obtenerCitas, cancelarCita } from '../services/api';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('es');

export default function MisCitas({ onVolver }) {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);

  useEffect(() => {
    cargarCitas();
  }, []);

  const cargarCitas = async () => {
    try {
      setLoading(true);
      const data = await obtenerCitas({ estado: 'confirmada' });
      setCitas(data.citas || []);
      setError(null);
    } catch (err) {
      setError('Error al cargar las citas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (cita) => {
    setCitaSeleccionada(cita);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCitaSeleccionada(null);
  };

  const handleCancelarCita = async () => {
    try {
      await cancelarCita(citaSeleccionada.id);
      await cargarCitas(); // Recargar lista
      handleCloseDialog();
    } catch (err) {
      setError('Error al cancelar la cita');
    }
  };

  const formatearFecha = (fecha) => {
    // La fecha viene en UTC desde la DB, primero parsear como UTC y luego convertir a Chile
    return dayjs.utc(fecha).tz('America/Santiago').format('dddd, D [de] MMMM [de] YYYY');
  };

  const formatearHora = (fecha) => {
    // La fecha viene en UTC desde la DB, primero parsear como UTC y luego convertir a Chile
    return dayjs.utc(fecha).tz('America/Santiago').format('HH:mm') + ' hrs';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CalendarTodayIcon sx={{ fontSize: 40, mr: 2, color: '#ff8c00', filter: 'drop-shadow(0 0 8px rgba(255, 140, 0, 0.4))' }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Mis citas
          </Typography>
        </Box>
        {onVolver && (
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={onVolver}
            sx={{
              borderColor: '#ff8c00',
              color: '#ffa500',
              fontWeight: 600,
              px: 3,
              py: 1,
              borderRadius: 2,
              textTransform: 'none',
              boxShadow: '0 2px 8px rgba(255, 140, 0, 0.2)',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: '#ffa500',
                bgcolor: 'rgba(255, 140, 0, 0.1)',
                transform: 'translateX(-4px)',
                boxShadow: '0 4px 16px rgba(255, 140, 0, 0.3)',
              },
            }}
          >
            Volver al menú
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {citas.length === 0 ? (
        <Card elevation={3}>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <CalendarTodayIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No tienes citas agendadas
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Grid container spacing={3} sx={{ maxWidth: '1000px' }}>
            {citas.map((cita) => (
              <Grid item xs={12} md={6} key={cita.id}>
                <Card 
                  elevation={0}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    background: 'linear-gradient(145deg, #2a2a2a 0%, #1f1f1f 100%)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 2,
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(255, 255, 255, 0.12)',
                      border: '1px solid rgba(255,255,255,0.15)',
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
                      <Typography variant="h6" component="div" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                        {cita.servicio_nombre}
                      </Typography>
                      <Chip
                        icon={<CheckCircleIcon />}
                        label="Confirmada"
                        size="small"
                        sx={{ 
                          fontWeight: 500,
                          bgcolor: 'rgba(255, 140, 0, 0.2)',
                          color: '#ffa500',
                          border: '1px solid rgba(255, 140, 0, 0.4)',
                          '& .MuiChip-icon': { color: '#ffa500' }
                        }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box component="span" sx={{ fontWeight: 600, minWidth: '80px', color: 'text.primary' }}>Fecha:</Box>
                        {formatearFecha(cita.fecha)}
                      </Typography>

                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box component="span" sx={{ fontWeight: 600, minWidth: '80px', color: 'text.primary' }}>Hora:</Box>
                        {formatearHora(cita.fecha)}
                      </Typography>

                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box component="span" sx={{ fontWeight: 600, minWidth: '80px', color: 'text.primary' }}>Duración:</Box>
                        {cita.duracion_minutos} minutos
                      </Typography>

                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <Box component="span" sx={{ fontWeight: 600, minWidth: '80px', color: 'text.primary' }}>Precio:</Box>
                        <Box component="span" sx={{ 
                          fontSize: '1rem', 
                          fontWeight: 700,
                          color: '#fff',
                          textShadow: '0 0 8px rgba(255,255,255,0.3)'
                        }}>
                          ${cita.precio_clp.toLocaleString('es-CL')} CLP
                        </Box>
                      </Typography>
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      size="medium"
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={() => handleOpenDialog(cita)}
                      sx={{ 
                        borderRadius: 1.5,
                        textTransform: 'none',
                        fontWeight: 500,
                        color: '#ff8c00',
                        borderColor: '#ff8c00',
                        '&:hover': {
                          borderColor: '#ffa500',
                          bgcolor: 'rgba(255, 140, 0, 0.1)'
                        }
                      }}
                    >
                      Cancelar cita
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Dialog de confirmación */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: '400px'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: '1.5rem', pb: 1 }}>
          Cancelar cita
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: '1rem', color: 'text.primary' }}>
            ¿Estás seguro de que deseas cancelar esta cita?
            {citaSeleccionada && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                  {citaSeleccionada.servicio_nombre}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatearFecha(citaSeleccionada.fecha)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hora: {formatearHora(citaSeleccionada.fecha)}
                </Typography>
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button 
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{ textTransform: 'none', fontWeight: 500, borderRadius: 1.5 }}
          >
            No, mantener
          </Button>
          <Button 
            onClick={handleCancelarCita} 
            variant="contained"
            sx={{ 
              textTransform: 'none', 
              fontWeight: 500, 
              borderRadius: 1.5,
              bgcolor: '#ff8c00',
              '&:hover': { bgcolor: '#ffa500' }
            }}
          >
            Sí, cancelar cita
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
