import { useState, useEffect } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { obtenerServicios, crearCita, obtenerCitas, obtenerHorarioSemanal } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

dayjs.locale('es');
dayjs.tz.setDefault('America/Santiago');

const steps = ['Elegir fecha y hora', 'Confirmar datos'];

// Mapeo de días en español a inglés para dayjs
const diasSemanaMap = {
  'domingo': 0,
  'lunes': 1,
  'martes': 2,
  'miercoles': 3,
  'jueves': 4,
  'viernes': 5,
  'sabado': 6
};

export default function AgendarCita({ servicioIdInicial, onCancelar }) {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [horarioSemanal, setHorarioSemanal] = useState([]);

  const [formData, setFormData] = useState({
    servicio_id: servicioIdInicial || '',
    cliente_nombre: usuario?.nombre || '',
    cliente_email: usuario?.email || '',
    cliente_telefono: usuario?.telefono || '',
    fecha: null,
    hora: ''
  });

  const [citasDelDia, setCitasDelDia] = useState([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);

  // Horarios disponibles dinámicos basados en configuración
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);

  useEffect(() => {
    cargarServicios();
    cargarHorarioSemanal();
  }, []);

  useEffect(() => {
    if (servicioIdInicial) {
      setFormData(prev => ({
        ...prev,
        servicio_id: servicioIdInicial
      }));
    }
  }, [servicioIdInicial]);

  const cargarServicios = async () => {
    try {
      const data = await obtenerServicios();
      setServicios(data.servicios || []);
    } catch (err) {
      setError('Error al cargar servicios');
    }
  };

  const cargarHorarioSemanal = async () => {
    try {
      const data = await obtenerHorarioSemanal();
      const horarios = data.horarios || [];
      
      setHorarioSemanal(horarios);
    } catch (err) {
      console.error('❌ Error al cargar horario semanal:', err);
      setError('Error al cargar configuración de horarios');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(null);
  };

  const handleDateChange = async (newDate) => {
    setFormData({
      ...formData,
      fecha: newDate,
      hora: '' // Resetear hora al cambiar fecha
    });
    setError(null);
    
    // Cargar citas del día seleccionado y generar horarios disponibles
    if (newDate) {
      await cargarCitasDelDia(newDate);
      generarHorariosDisponibles(newDate);
    }
  };

  // Generar horarios disponibles según el día seleccionado
  const generarHorariosDisponibles = (fecha) => {
    const diaSemana = fecha.day();
    const horarioDia = horarioSemanal.find(h => h.dia_semana === diaSemana);
    
    if (!horarioDia || !horarioDia.es_laboral) {
      setHorariosDisponibles([]);
      return;
    }
    
    // Verificar que tenga horas configuradas
    if (!horarioDia.hora_apertura || !horarioDia.hora_cierre) {
      setHorariosDisponibles([]);
      return;
    }
    
    // Parsear horas de apertura y cierre (formato HH:MM:SS o HH:MM)
    const horaApertura = parseInt(horarioDia.hora_apertura.split(':')[0]);
    const horaCierre = parseInt(horarioDia.hora_cierre.split(':')[0]);
    
    // Parsear horario de descanso si existe
    let horaDescansoInicio = null;
    let horaDescansoFin = null;
    if (horarioDia.hora_descanso_inicio && horarioDia.hora_descanso_fin) {
      horaDescansoInicio = parseInt(horarioDia.hora_descanso_inicio.split(':')[0]);
      horaDescansoFin = parseInt(horarioDia.hora_descanso_fin.split(':')[0]);
    }
    
    // Generar horarios disponibles
    const horarios = [];
    for (let hora = horaApertura; hora < horaCierre; hora++) {
      // Excluir horarios de descanso
      if (horaDescansoInicio !== null && hora >= horaDescansoInicio && hora < horaDescansoFin) {
        continue;
      }
      horarios.push(`${hora.toString().padStart(2, '0')}:00`);
    }
    
    setHorariosDisponibles(horarios);
  };

  const cargarCitasDelDia = async (fecha) => {
    try {
      setLoadingHorarios(true);
      const fechaISO = fecha.format('YYYY-MM-DD');
      
      // Crear rango del día completo en timezone de Chile, luego convertir a UTC para la API
      const inicioDelDiaChile = fecha.startOf('day'); // inicio del día en Chile
      const finDelDiaChile = fecha.endOf('day'); // fin del día en Chile
      
      // Convertir a UTC para enviar a la API
      const inicioDelDia = inicioDelDiaChile.utc().format();
      const finDelDia = finDelDiaChile.utc().format();
      
      const response = await obtenerCitas({ 
        fecha_desde: inicioDelDia,
        fecha_hasta: finDelDia,
        estado: 'confirmada'
      });
      const citas = response.citas || [];
      
      setCitasDelDia(citas);
    } catch (err) {
      console.error('Error al cargar citas del día:', err);
      setCitasDelDia([]);
    } finally {
      setLoadingHorarios(false);
    }
  };

  const handleHoraClick = (hora) => {
    setFormData({
      ...formData,
      hora: hora
    });
  };

  const shouldDisableDate = (date) => {
    // Bloquear fechas pasadas (usando zona horaria de Chile)
    const hoy = dayjs.tz(new Date(), 'America/Santiago').startOf('day');
    if (date.isBefore(hoy)) {
      return true;
    }
    
    // Si no hay horario semanal cargado aún, no bloquear nada mientras carga
    if (!horarioSemanal || horarioSemanal.length === 0) {
      return false; 
    }
    
    // Buscar configuración del día
    const diaSemana = date.day();
    const horarioDia = horarioSemanal.find(h => h.dia_semana === diaSemana);
    
    // Si no hay configuración para ese día, asumimos que NO es laboral
    if (!horarioDia) {
      return true;
    }
    
    // Si está configurado explícitamente como no laboral o no tiene horarios
    const bloqueado = !horarioDia.es_laboral || !horarioDia.hora_apertura || !horarioDia.hora_cierre;
    
    return bloqueado;
  };

  const isHorarioOcupado = (hora) => {
    // Verificar si alguna cita existente se solapa con este horario
    const servicioActual = servicios.find(s => s.id === parseInt(formData.servicio_id));
    const duracionActual = servicioActual ? servicioActual.duracion_minutos : 60;
    
    // Convertir la hora actual a minutos desde medianoche para cálculos
    const [horaNum, minNum] = hora.split(':').map(Number);
    const minutoHoraActual = horaNum * 60 + minNum;
    const minutoNuevoFin = minutoHoraActual + duracionActual;
    
    // Verificar solapamiento con citas existentes
    return citasDelDia.some(cita => {
      const citaChile = dayjs.utc(cita.fecha).tz('America/Santiago');
      const citaHoraInicio = citaChile.format('HH:mm');
      const [citaHoraNum, citaMinNum] = citaHoraInicio.split(':').map(Number);
      const minutoCitaInicio = citaHoraNum * 60 + citaMinNum;
      
      // Duración de la cita existente
      const duracionCita = cita.duracion_minutos || 60;
      const minutoCitaFin = minutoCitaInicio + duracionCita;
      
      // Hay conflicto si hay cualquier tipo de solapamiento
      const hayConflicto = (
        (minutoHoraActual >= minutoCitaInicio && minutoHoraActual < minutoCitaFin) || // Empieza durante cita existente
        (minutoNuevoFin > minutoCitaInicio && minutoNuevoFin <= minutoCitaFin) || // Termina durante cita existente
        (minutoHoraActual <= minutoCitaInicio && minutoNuevoFin >= minutoCitaFin) // Conflicto de horarios
      );
      
      return hayConflicto;
    });
  };

  const isHorarioInsuficiente = (hora) => {
    // Verificar si hay suficiente tiempo hasta el cierre O hasta la siguiente cita ocupada
    if (!formData.fecha) return false;
    
    const servicioActual = servicios.find(s => s.id === parseInt(formData.servicio_id));
    const duracionActual = servicioActual ? servicioActual.duracion_minutos : 60;
    
    const [horaNum, minNum] = hora.split(':').map(Number);
    const minutoHoraActual = horaNum * 60 + minNum;
    const minutoNuevoFin = minutoHoraActual + duracionActual;
    
    // 1. Verificar si se extiende más allá del cierre
    const diaSemana = formData.fecha.day();
    const horarioDia = horarioSemanal.find(h => h.dia_semana === diaSemana);
    
    if (horarioDia && horarioDia.hora_cierre) {
      const [horaCierreNum] = horarioDia.hora_cierre.split(':').map(Number);
      const minutoCierre = horaCierreNum * 60;
      
      if (minutoNuevoFin > minutoCierre) {
        return true;
      }
    }
    
    // 2. Verificar si hay una cita ocupada que empieza ANTES de que termine este servicio
    const hayColisionConSiguienteCita = citasDelDia.some(cita => {
      const citaChile = dayjs.utc(cita.fecha).tz('America/Santiago');
      const citaHoraInicio = citaChile.format('HH:mm');
      const [citaHoraNum, citaMinNum] = citaHoraInicio.split(':').map(Number);
      const minutoCitaInicio = citaHoraNum * 60 + citaMinNum;
      
      // Si la cita existente empieza después de nuestra hora actual
      // pero antes de que termine nuestro servicio, NO hay espacio suficiente
      return minutoCitaInicio >= minutoHoraActual && minutoCitaInicio < minutoNuevoFin;
    });
    
    return hayColisionConSiguienteCita;
  };

  const isHorarioPasado = (hora) => {
    if (!formData.fecha) return false;
    
    // Obtener la fecha actual en zona horaria de Chile
    const ahora = dayjs.tz(new Date(), 'America/Santiago');
    const fechaSeleccionada = formData.fecha.startOf('day');
    
    // Si la fecha seleccionada NO es hoy, no hay horarios pasados
    if (!fechaSeleccionada.isSame(ahora, 'day')) return false;
    
    // Si es hoy, comparar la hora
    const [horaNum] = hora.split(':').map(Number);
    const horaActual = ahora.hour();
    
    // Si la hora ya pasó, bloquear
    return horaNum <= horaActual;
  };



  const handleNext = () => {
    setError(null); // Limpiar error al avanzar
    setLoading(false); // Asegurar que no esté en loading
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setError(null); // Limpiar error al retroceder
    if (activeStep === 0) {
      if (onCancelar) {
        onCancelar();
      }
    } else {
      setActiveStep((prevStep) => prevStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validar campos antes de empezar
    if (!formData.cliente_nombre || !formData.cliente_email) {
      setError('Por favor completa nombre y email');
      return;
    }

    // Aquí empieza la animación de carga
    setLoading(true);

    try {
      // Crear fecha en timezone de Chile y convertir a ISO
      const fechaHoraChile = dayjs.tz(`${formData.fecha.format('YYYY-MM-DD')}T${formData.hora}`, 'America/Santiago');
      const fechaISO = fechaHoraChile.toISOString();

      const citaData = {
        servicio_id: parseInt(formData.servicio_id),
        usuario_id: usuario.id,
        cliente_nombre: formData.cliente_nombre,
        cliente_email: formData.cliente_email,
        cliente_telefono: formData.cliente_telefono || null,
        fecha: fechaISO
      };

      await crearCita(citaData);
      setSuccess(true);
      
      // Después de 3 segundos, volver al menú de servicios
      setTimeout(() => {
        if (onCancelar) {
          onCancelar();
        }
      }, 3000);
    } catch (err) {
      console.error('❌ Error al crear cita:', err);
      setError(err.response?.data?.error || 'Error al crear la cita');
      setLoading(false);
    }
  };

  const servicioSeleccionado = servicios.find(s => s.id === parseInt(formData.servicio_id));

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Box sx={{ display: 'flex', flexWrap: { xs: 'wrap', md: 'nowrap' }, gap: 4 }}>
              {/* Calendario */}
              <Box sx={{ flex: { xs: '1 1 100%', md: '0 0 auto' }, minWidth: { md: '350px' } }}>
                <Box>
                  <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                    Selecciona la fecha
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    {loading ? (
                      <CircularProgress />
                    ) : (
                      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                        <DateCalendar
                          key={horarioSemanal.length} // Forzar re-render cuando carguen los horarios
                          value={formData.fecha}
                          onChange={handleDateChange}
                          shouldDisableDate={shouldDisableDate}
                          minDate={dayjs('2025-01-01')}
                          maxDate={dayjs('2026-12-31')}
                          timezone="America/Santiago"
                          views={['year', 'month', 'day']}
                          sx={{
                            bgcolor: 'background.paper',
                            borderRadius: 3,
                            boxShadow: '0 4px 16px rgba(255, 140, 0, 0.15)',
                            border: '1px solid rgba(255, 140, 0, 0.2)',
                            width: '100%',
                            maxWidth: 360,
                            '& .MuiPickersCalendarHeader-root': {
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              paddingLeft: 2,
                              paddingRight: 2,
                              color: '#ffa500',
                            },
                            '& .MuiPickersCalendarHeader-labelContainer': {
                              margin: '0 auto',
                              textAlign: 'center',
                            },
                            '& .MuiPickersCalendarHeader-label': {
                              textAlign: 'center',
                              color: '#ffa500',
                              fontWeight: 600,
                            },
                            '& .MuiPickersArrowSwitcher-button': {
                              color: '#ff8c00',
                              '&:hover': {
                                bgcolor: 'rgba(255, 140, 0, 0.1)',
                              },
                            },
                            '& .MuiDayCalendar-weekDayLabel': {
                              width: 40,
                              height: 40,
                              fontSize: '0.875rem',
                              color: '#ffa500',
                              fontWeight: 600,
                            },
                            '& .MuiPickersDay-root': {
                              width: 40,
                              height: 40,
                              fontSize: '1rem',
                              '&:hover': {
                                bgcolor: 'rgba(255, 140, 0, 0.1)',
                              },
                              '&.Mui-selected': {
                                bgcolor: '#ff8c00 !important',
                                color: '#fff',
                                fontWeight: 700,
                                '&:hover': {
                                  bgcolor: '#ffa500 !important',
                                },
                              },
                              '&.MuiPickersDay-today': {
                                border: '2px solid #ff8c00',
                                fontWeight: 600,
                              },
                            },
                            '& .MuiYearCalendar-root': {
                              width: '100%',
                            },
                            '& .MuiPickersYear-yearButton': {
                              fontSize: '1rem',
                              '&:hover': {
                                bgcolor: 'rgba(255, 140, 0, 0.1)',
                              },
                              '&.Mui-selected': {
                                bgcolor: '#ff8c00 !important',
                                color: '#fff',
                                fontWeight: 700,
                                '&:hover': {
                                  bgcolor: '#ffa500 !important',
                                },
                              },
                            },
                            '& .MuiPickersMonth-monthButton': {
                              '&:hover': {
                                bgcolor: 'rgba(255, 140, 0, 0.1)',
                              },
                              '&.Mui-selected': {
                                bgcolor: '#ff8c00 !important',
                                color: '#fff',
                                fontWeight: 700,
                                '&:hover': {
                                  bgcolor: '#ffa500 !important',
                                },
                              },
                            },
                          }}
                        />
                      </LocalizationProvider>
                    )}
                  </Box>
                </Box>
              </Box>
              {/* Horarios */}
              <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 auto' } }}>
                {!formData.fecha ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px' }}>
                    <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', maxWidth: '200px' }}>
                      Selecciona una fecha para ver<br/>los horarios disponibles
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                      <AccessTimeIcon />
                      Selecciona la hora
                    </Typography>
                
                {loadingHorarios ? (
                  <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                  </Box>
                ) : horariosDisponibles.length === 0 ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                    <Alert severity="warning" sx={{ maxWidth: '400px' }}>
                      No hay horarios disponibles para este día. Por favor selecciona otra fecha.
                    </Alert>
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    {horariosDisponibles.map((hora) => {
                      const ocupado = isHorarioOcupado(hora);
                      const pasado = isHorarioPasado(hora);
                      const insuficiente = isHorarioInsuficiente(hora);
                      const bloqueado = ocupado || pasado || insuficiente;
                      
                      return (
                        <Grid item xs={6} sm={4} md={3} key={hora}>
                          <Button
                            fullWidth
                            variant={formData.hora === hora ? 'contained' : 'outlined'}
                            onClick={() => handleHoraClick(hora)}
                            disabled={bloqueado}
                            sx={{
                              py: 1.5,
                              fontSize: '1.1rem',
                              transition: 'all 0.3s',
                              opacity: bloqueado ? 0.5 : 1,
                              borderColor: bloqueado && !insuficiente ? '#ff8c00' : undefined,
                              color: bloqueado && !insuficiente ? '#ff8c00' : undefined,
                              '&:hover': {
                                transform: bloqueado ? 'none' : 'scale(1.05)',
                                borderColor: !bloqueado ? '#ffa500' : undefined,
                              },
                              position: 'relative'
                            }}
                          >
                            {hora}
                            {ocupado && (
                              <Chip
                                label="Ocupado"
                                size="small"
                                sx={{
                                  position: 'absolute',
                                  top: 4,
                                  right: 4,
                                  height: 18,
                                  fontSize: '0.65rem',
                                  bgcolor: 'rgba(255, 140, 0, 0.3)',
                                  color: '#ff8c00'
                                }}
                              />
                            )}
                            {pasado && !ocupado && (
                              <Chip
                                label="Expirado"
                                size="small"
                                sx={{
                                  position: 'absolute',
                                  top: 4,
                                  right: 4,
                                  height: 18,
                                  fontSize: '0.65rem',
                                  bgcolor: 'rgba(255, 140, 0, 0.2)',
                                  color: '#ffa500'
                                }}
                              />
                            )}
                          </Button>
                        </Grid>
                      );
                    })}
                    </Grid>
                  )}
                </Box>
                )}
              </Box>
            </Box>
          </Box>
        );
      
      case 1:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: '600px', mx: 'auto' }}>
            {loading ? (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                minHeight: '400px',
                gap: 3
              }}>
                <CircularProgress size={80} thickness={4} sx={{ color: 'primary.main' }} />
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ 
                    animation: 'pulse 1.5s ease-in-out infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.6 }
                    }
                  }}>
                    Procesando tu cita...
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Por favor espera un momento
                  </Typography>
                </Box>
              </Box>
            ) : (
              <>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Confirma tus datos
                </Typography>
                
                <TextField
                  fullWidth
                  name="cliente_nombre"
                  label="Nombre completo *"
                  value={formData.cliente_nombre}
                  onChange={handleChange}
                  required
                  helperText="Puedes editar tu nombre"
                />
                <TextField
                  fullWidth
                  type="email"
                  name="cliente_email"
                  label="Email *"
                  value={formData.cliente_email}
                  onChange={handleChange}
                  required
                  helperText="Puedes editar tu email"
                />
                <TextField
                  fullWidth
                  type="tel"
                  name="cliente_telefono"
                  label="Teléfono"
                  value={formData.cliente_telefono}
                  onChange={handleChange}
                  placeholder="+56 9 1234 5678"
                  helperText="Opcional"
                />
                
                {servicioSeleccionado && formData.fecha && (
                  <Card variant="outlined" sx={{ mt: 2, bgcolor: 'background.paper' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Resumen de la cita</Typography>
                      <Typography><strong>Servicio:</strong> {servicioSeleccionado.nombre}</Typography>
                      <Typography><strong>Fecha:</strong> {formData.fecha.format('dddd, D [de] MMMM [de] YYYY')}</Typography>
                      <Typography><strong>Hora:</strong> {formData.hora} hrs</Typography>
                      <Typography><strong>Duración:</strong> {servicioSeleccionado.duracion_minutos} minutos</Typography>
                      <Typography><strong>Precio:</strong> ${servicioSeleccionado.precio_clp.toLocaleString('es-CL')} CLP</Typography>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </Box>
        );
      
      default:
        return 'Paso desconocido';
    }
  };

  if (success) {
    return (
      <Box sx={{ maxWidth: '700px', mx: 'auto', mt: 8 }}>
        <Card
          elevation={0}
          sx={{
            background: 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 100%)',
            border: '2px solid',
            borderColor: '#ff8c00',
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(255, 140, 0, 0.3)',
            p: 6,
            textAlign: 'center'
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 100, mb: 3, color: '#ffa500' }} />
          <Typography variant="h3" gutterBottom fontWeight="bold">
            ¡Cita agendada!
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Tu cita ha sido agendada exitosamente
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Recibirás una confirmación en tu email
          </Typography>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '900px', mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, justifyContent: 'center' }}>
        <EventIcon sx={{ fontSize: 48, mr: 2, color: 'primary.main' }} />
        <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
          Agendar cita
        </Typography>
      </Box>

      <Card 
        elevation={0}
        sx={{
          background: 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 100%)',
          border: '2px solid',
          borderColor: '#333',
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          p: 4
        }}
      >
        <Stepper 
          activeStep={activeStep} 
          sx={{ 
            mb: 4,
            '& .MuiStepLabel-label': {
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ width: '100%' }}>
            {getStepContent(activeStep)}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, visibility: loading ? 'hidden' : 'visible' }}>
          <Button
            onClick={activeStep === 0 ? onCancelar : handleBack}
            variant="outlined"
            disabled={loading}
            sx={{
              borderColor: '#ff8c00',
              color: '#ffa500',
              fontWeight: 500,
              px: 3,
              py: 1,
              textTransform: 'none',
              borderRadius: 1.5,
              '&:hover': {
                borderColor: '#ffa500',
                bgcolor: 'rgba(255, 140, 0, 0.1)',
              },
            }}
          >
            {activeStep === 0 ? 'Cancelar' : 'Atrás'}
          </Button>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            {activeStep < steps.length - 1 ? (
              <Button
                type="button"
                variant="contained"
                onClick={handleNext}
                disabled={
                  (activeStep === 0 && (!formData.fecha || !formData.hora))
                }
                sx={{
                  bgcolor: '#ff8c00',
                  color: '#fff',
                  fontWeight: 500,
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  borderRadius: 1.5,
                  '&:hover': {
                    bgcolor: '#ffa500',
                  },
                  '&:disabled': {
                    bgcolor: 'rgba(255, 140, 0, 0.3)',
                    color: 'rgba(255, 255, 255, 0.5)',
                  },
                }}
              >
                Siguiente
              </Button>
            ) : (
              <form onSubmit={handleSubmit} style={{ margin: 0 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || !formData.cliente_nombre || !formData.cliente_email}
                  sx={{
                    bgcolor: '#ff8c00',
                    color: '#fff',
                    fontWeight: 500,
                    px: 3,
                    py: 1,
                    textTransform: 'none',
                    borderRadius: 1.5,
                    '&:hover': {
                      bgcolor: '#ffa500',
                    },
                    '&:disabled': {
                      bgcolor: 'rgba(255, 140, 0, 0.3)',
                      color: 'rgba(255, 255, 255, 0.5)',
                    },
                  }}
                >
                  {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Confirmar cita'}
                </Button>
              </form>
            )}
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
