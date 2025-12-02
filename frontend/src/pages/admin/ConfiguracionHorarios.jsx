import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Divider
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SaveIcon from '@mui/icons-material/Save';
import { obtenerConfiguracion, actualizarConfiguracion } from '../../services/adminApi';

const diasSemana = [
  { numero: 0, label: 'Domingo' },
  { numero: 1, label: 'Lunes' },
  { numero: 2, label: 'Martes' },
  { numero: 3, label: 'Miércoles' },
  { numero: 4, label: 'Jueves' },
  { numero: 5, label: 'Viernes' },
  { numero: 6, label: 'Sábado' }
];

export default function ConfiguracionHorarios() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Array de 7 días con su configuración
  const [horarios, setHorarios] = useState([]);
  const [horaApertura, setHoraApertura] = useState('10:00');
  const [horaCierre, setHoraCierre] = useState('19:00');

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  const cargarConfiguracion = async () => {
    try {
      setLoading(true);
      const data = await obtenerConfiguracion();
      
      const horariosRecibidos = data.horarios || [];
      // Horarios cargados exitosamente
      
      // Asegurar que siempre tengamos 7 días, incluso si faltan algunos en la DB
      const horariosCompletos = diasSemana.map(d => {
        const horarioExistente = horariosRecibidos.find(h => h.dia_semana === d.numero);
        return horarioExistente || {
          dia_semana: d.numero,
          es_laboral: false,
          hora_apertura: null,
          hora_cierre: null,
          hora_descanso_inicio: null,
          hora_descanso_fin: null
        };
      });
      
      setHorarios(horariosCompletos);
      
      // Tomar horarios del primer día laboral
      const diaLaboral = horariosCompletos.find(h => h.es_laboral);
      if (diaLaboral && diaLaboral.hora_apertura && diaLaboral.hora_cierre) {
        setHoraApertura(diaLaboral.hora_apertura.substring(0, 5));
        setHoraCierre(diaLaboral.hora_cierre.substring(0, 5));
      }
    } catch (err) {
      console.error('Error al cargar configuración:', err);
      setError(err.response?.data?.error || 'Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleDiaChange = (diaSemana) => {
    setHorarios(prev => prev.map(h => 
      h.dia_semana === diaSemana 
        ? { ...h, es_laboral: !h.es_laboral }
        : h
    ));
    setError(null);
    setSuccess(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfiguracion(prev => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(false);
  };

  const convertirA24Horas = (hora) => {
    // Si ya está en formato 24h (HH:MM), retornar tal cual
    if (hora.match(/^\d{2}:\d{2}$/)) {
      return hora;
    }
    
    // Convertir de 12h AM/PM a 24h
    const match = hora.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (match) {
      let [_, horas, minutos, periodo] = match;
      horas = parseInt(horas);
      
      if (periodo.toUpperCase() === 'PM' && horas !== 12) {
        horas += 12;
      } else if (periodo.toUpperCase() === 'AM' && horas === 12) {
        horas = 0;
      }
      
      return `${horas.toString().padStart(2, '0')}:${minutos}`;
    }
    
    return hora;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const diasLaborales = horarios.filter(h => h.es_laboral).length;
    if (diasLaborales === 0) {
      setError('Debes seleccionar al menos un día laboral');
      return;
    }

    // Convertir a formato 24 horas
    const apertura24 = convertirA24Horas(horaApertura);
    const cierre24 = convertirA24Horas(horaCierre);

    if (cierre24 <= apertura24) {
      setError('La hora de cierre debe ser posterior a la de apertura');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      // Asegurar que siempre tengamos 7 días antes de enviar
      if (horarios.length !== 7) {
        console.error('❌ No hay 7 días en el array:', horarios.length);
        setError(`Error: Se esperaban 7 días pero hay ${horarios.length}`);
        setSaving(false);
        return;
      }
      
      // Construir array de 7 días con la configuración
      const horariosParaEnviar = horarios.map(h => ({
        dia_semana: h.dia_semana,
        es_laboral: h.es_laboral,
        hora_apertura: h.es_laboral ? `${apertura24}:00` : null,
        hora_cierre: h.es_laboral ? `${cierre24}:00` : null,
        hora_descanso_inicio: null,
        hora_descanso_fin: null
      }));

      console.log('📤 Enviando horarios al backend:', {
        cantidad: horariosParaEnviar.length,
        horarios: horariosParaEnviar
      });
      
      await actualizarConfiguracion(horariosParaEnviar);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('❌ Error al guardar:', err);
      setError(err.response?.data?.error || err.response?.data?.detalle || 'Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  const calcularBloques = () => {
    if (!horaApertura || !horaCierre) return 0;
    
    const [hA, mA] = horaApertura.split(':').map(Number);
    const [hC, mC] = horaCierre.split(':').map(Number);
    
    const minutosApertura = hA * 60 + mA;
    const minutosCierre = hC * 60 + mC;
    
    const totalMinutos = minutosCierre - minutosApertura;
    return Math.floor(totalMinutos / 60);
  };

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
          <AccessTimeIcon fontSize="large" />
          Configuración de horarios
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Define los días y horarios de atención de tu negocio
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Configuración guardada exitosamente
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Días laborales
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Selecciona los días que trabajarás
                </Typography>
                
                <FormGroup>
                  {diasSemana.map((dia) => {
                    const horarioDia = horarios.find(h => h.dia_semana === dia.numero);
                    return (
                      <FormControlLabel
                        key={dia.numero}
                        control={
                          <Checkbox
                            checked={horarioDia?.es_laboral || false}
                            onChange={() => handleDiaChange(dia.numero)}
                            color="primary"
                          />
                        }
                        label={dia.label}
                      />
                    );
                  })}
                </FormGroup>

                {horarios.filter(h => h.es_laboral).length > 0 && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Días seleccionados: {horarios.filter(h => h.es_laboral).length}
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  Horario de atención
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Define el horario de apertura y cierre
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    fullWidth
                    type="time"
                    name="hora_apertura"
                    label="Hora de apertura"
                    value={horaApertura}
                    onChange={(e) => setHoraApertura(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      step: 3600, // 1 hora
                      pattern: "[0-9]{2}:[0-9]{2}"
                    }}
                    required
                    helperText="Formato 24 horas (ej: 14:00)"
                  />

                  <TextField
                    fullWidth
                    type="time"
                    name="hora_cierre"
                    label="Hora de cierre"
                    value={horaCierre}
                    onChange={(e) => setHoraCierre(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{
                      step: 3600, // 1 hora
                      pattern: "[0-9]{2}:[0-9]{2}"
                    }}
                    required
                    helperText="Hora del último turno disponible (formato 24h, ej: 20:00)"
                  />

                  <TextField
                    fullWidth
                    type="number"
                    name="bloques_duracion_minutos"
                    label="Duración de cada turno (minutos)"
                    value={60}
                    disabled
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiInputBase-input.Mui-disabled': {
                        WebkitTextFillColor: '#666',
                        cursor: 'not-allowed'
                      }
                    }}
                    helperText="La duración está bloqueada a 60 minutos por sistema"
                  />

                  <Divider />

                  <Box>
                    <Typography variant="body2" color="primary" fontWeight="bold">
                      Turnos disponibles por día: {calcularBloques()}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                type="button"
                variant="outlined"
                onClick={cargarConfiguracion}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={saving}
                size="large"
              >
                {saving ? 'Guardando...' : 'Guardar configuración'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}
